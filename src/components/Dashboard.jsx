import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import MediaCard from "./components/MediaCard";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";

const mediaData = [];
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3/search/multi";
const BASE_IMG = "https://image.tmdb.org/t/p/w500";

const completarIdTMDb = async () => {
  // Obtener ítems sin id_tmdb
  const { data: catalogo, error } = await supabase
    .from("catalogo")
    .select("*")
    .is("id_tmdb", null);

  if (error) {
    console.error("Error al obtener ítems:", error);
    return;
  }

  for (const item of catalogo) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(
          item.nombre
        )}&language=es-ES`
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const resultado = data.results[0];
        const nuevoId = resultado.id;

        // Guardar en Supabase
        const { error: updateError } = await supabase
          .from("catalogo")
          .update({ id_tmdb: nuevoId })
          .eq("id", item.id);

        if (updateError) {
          console.error(`Error al actualizar ${item.nombre}:`, updateError);
        } else {
          console.log(`✅ Actualizado ${item.nombre} con id_tmdb: ${nuevoId}`);
        }
      } else {
        console.warn(`⚠️ No se encontró resultado para: ${item.nombre}`);
      }
    } catch (err) {
      console.error(`❌ Error con TMDb para ${item.nombre}:`, err);
    }
  }

  setMensaje({ tipo: "ok", texto: "Actualización de ID TMDb completada" });
  setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
};

const completarCatalogo = async () => {
  const actualizado = await Promise.all(
    catalogo.map(async (item) => {
      if (item.imagen && item.sinopsis && item.anio) return item;

      try {
        // 1. Buscar por nombre
        const res = await fetch(
          `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(
            item.nombre
          )}&language=es-ES`
        );
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const resultado = data.results[0]; // El más relevante

          const nuevosDatos = {
            imagen: resultado.poster_path
              ? BASE_IMG + resultado.poster_path
              : item.imagen || null,
            sinopsis:
              resultado.overview ||
              item.sinopsis ||
              "Sin información disponible.",
            anio:
              resultado.first_air_date?.slice(0, 4) ||
              resultado.release_date?.slice(0, 4) ||
              item.anio ||
              "Desconocido",
          };

          // Actualizar en Supabase
          const { error } = await supabase
            .from("catalogo")
            .update(nuevosDatos)
            .eq("id", item.id);

          if (error) {
            console.error(`Error actualizando "${item.nombre}":`, error);
          }

          return { ...item, ...nuevosDatos };
        }
        return item;
      } catch (error) {
        console.error("Error con TMDb:", item.nombre, error);
        return item;
      }
    })
  );

  setCatalogo(actualizado);
  setMensaje({ tipo: "ok", texto: "¡Catálogo actualizado!" });
  setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
};

const agregarNuevoItem = async (e) => {
  e.preventDefault();

  if (!nuevoItem.nombre.trim() || !nuevoItem.plataformas.trim()) {
    setMensaje({
      tipo: "error",
      texto: "Por favor completa todos los campos obligatorios.",
    });
    return;
  }

  const buscarEnTMDb = async (nombre) => {
    const buscar = async (idioma) => {
      const res = await fetch(
        `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(
          nombre
        )}&language=${idioma}`
      );
      const data = await res.json();
      return data.results || [];
    };

    let resultados = await buscar("es-ES");

    if (
      resultados.length === 0 ||
      !resultados[0].overview ||
      resultados[0].overview.trim() === ""
    ) {
      resultados = await buscar("en-US");
    }

    const r = resultados[0];

    return {
      id_tmdb: r.id,
      user_id: usuario.id,
      imagen: r?.poster_path ? BASE_IMG + r.poster_path : null,
      sinopsis: r?.overview || "Sin información disponible.",
      anio:
        r?.first_air_date?.slice(0, 4) ||
        r?.release_date?.slice(0, 4) ||
        "Desconocido",
      number_of_seasons: r?.number_of_seasons,
    };
  };

  try {
    const infoTMDb = await buscarEnTMDb(nuevoItem.nombre);

    const nuevo = {
      nombre: infoTMDb.title || infoTMDb.name,
      user_id: usuario.id,
      tipo: infoTMDb.media_type === "tv" ? "Serie" : "Película",
      id_tmdb: infoTMDb.id, // 👈 aquí está el ID de TMDb
      imagen: infoTMDb.poster_path ? BASE_IMG + infoTMDb.poster_path : null,
      sinopsis: infoTMDb.overview || "Sin sinopsis disponible.",
      anio:
        infoTMDb.first_air_date?.slice(0, 4) ||
        infoTMDb.release_date?.slice(0, 4) ||
        "Desconocido",
      plataformas: [],
      proximo_episodio: null,
      number_of_seasons: infoTMDb.number_of_seasons,
    };
    const { error } = await supabase.from("catalogo").insert([nuevo]);
    if (error) {
      console.error("Error al guardar en Supabase:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al guardar en la base de datos",
      });
    } else {
      setMensaje({ tipo: "ok", texto: "¡Contenido añadido con éxito!" });
      setNuevoItem({
        nombre: "",
        tipo: "Anime",
        proximoEpisodio: "",
        plataformas: "",
      });

      const { data } = await supabase
        .from("catalogo")
        .select("*")
        .order("creado_en", { ascending: false });
      setCatalogo(data);
    }
  } catch (error) {
    console.error("Error al buscar en TMDb:", error);
    setMensaje({ tipo: "error", texto: "Error al buscar datos en TMDb" });
  }
  setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
};

const actualizarItem = async (id, campos) => {
  const { error } = await supabase.from("catalogo").update(campos).eq("id", id);

  if (error) {
    console.error("Error al actualizar:", error);
    setMensaje({ tipo: "error", texto: "Error al actualizar el ítem" });
  } else {
    // Refrescar datos del catálogo
    const { data } = await supabase
      .from("catalogo")
      .select("*")
      .order("creado_en", { ascending: false });
    setCatalogo(data);
  }
};

const eliminarItem = async (id) => {
  const confirmar = window.confirm(
    "¿Seguro que quieres eliminar este elemento?"
  );
  if (!confirmar) return;
  const { error } = await supabase.from("catalogo").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar:", error);
    setMensaje({ tipo: "error", texto: "No se pudo eliminar el ítem" });
  } else {
    // Recargar el catálogo actualizado
    const { data, error } = await supabase
      .from("catalogo")
      .select("*")
      .order("creado_en", { ascending: false });
    if (error) {
      console.error("Error al cargar el catálogo:", error);
    }
    const catalogoProcesado = data.map((item) => ({
      ...item,
      plataformas: item.plataformas
        ? item.plataformas.split(",").map((p) => p.trim())
        : [],
    }));
    setCatalogo(catalogoProcesado);
    setMensaje({ tipo: "ok", texto: "Elemento eliminado" });
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 2000);
  }
};

const dataFiltrada = catalogo
  .filter((item) => (filtroTipo === "Todos" ? true : item.tipo === filtroTipo))
  .filter((item) => item.nombre.toLowerCase().includes(busqueda.toLowerCase()));
const incompleto = true; //catalogo.some((item) => !item.imagen || !item.sinopsis || !item.anio);

const guardarSeleccionTMDB = async (resultado) => {
  const BASE_IMG = "https://image.tmdb.org/t/p/w500";

  const nuevosDatos = {
    imagen: resultado.poster_path ? BASE_IMG + resultado.poster_path : null,
    sinopsis: resultado.overview || "Sin información disponible.",
    anio:
      resultado.first_air_date?.slice(0, 4) ||
      resultado.release_date?.slice(0, 4) ||
      "Desconocido",
    number_of_seasons: resultado.number_of_seasons,
  };

  const { error } = await supabase
    .from("catalogo")
    .update(nuevosDatos)
    .eq("id", seleccionando.id);

  if (!error) {
    setMensaje({ tipo: "ok", texto: "Datos guardados con éxito" });
    const { data } = await supabase
      .from("catalogo")
      .select("*")
      .order("creado_en", { ascending: false });
    setCatalogo(data);
  } else {
    setMensaje({ tipo: "error", texto: "Error al guardar en Supabase" });
  }

  // Cerrar modal
  setSeleccionando(null);
  setResultadosTMDB([]);
};

const forzarActualizacionItem = async (item) => {
  try {
    const resultados = await buscarEnTMDb(item.nombre);
    console.log("Resultados de TMDb:", resultados);

    if (resultados.length > 0) {
      setResultadosTMDB(resultados); // Mostrar opciones en el modal
      setSeleccionando(item); // Guardar el ítem que se está completando
    } else {
      setMensaje({
        tipo: "error",
        texto: "No se encontraron resultados en ningún idioma.",
      });
    }
  } catch (error) {
    console.error(error);
    setMensaje({ tipo: "error", texto: "Error al consultar TMDb" });
  }
};

const buscarEnTMDb = async (nombre) => {
  // Subfunción para hacer la búsqueda con idioma dado
  const buscar = async (idioma) => {
    const res = await fetch(
      `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(
        nombre
      )}&language=${idioma}`
    );
    const data = await res.json();
    return data.results || [];
  };

  // 🔍 Paso 1: intenta en español
  let resultados = await buscar("es-ES");

  // 🔁 Paso 2: si no hay sinopsis o resultados, intenta en inglés
  if (
    resultados.length === 0 ||
    !resultados[0].overview ||
    resultados[0].overview.trim() === ""
  ) {
    resultados = await buscar("en-US");
  }

  // 🔁 Formatear los resultados
  return resultados.map((r) => ({
    id_tmdb: r.id,
    user_id: usuario.id,
    nombre: r.title || r.name,
    sinopsis: r.overview || "Sin sinopsis disponible",
    anio:
      r.first_air_date?.slice(0, 4) ||
      r.release_date?.slice(0, 4) ||
      "Desconocido",
    imagen: r.poster_path ? BASE_IMG + r.poster_path : null,
    tipo: r.media_type,
    plataformas: [],
    number_of_seasons: r.number_of_seasons,
  }));
};

const agregarDesdeSugerencia = async (sugerencia) => {
  const BASE_IMG = "https://image.tmdb.org/t/p/w500";

  const nuevo = {
    id_tmdb: sugerencia.id,
    user_id: usuario.id,
    nombre: sugerencia.title || sugerencia.name,
    tipo: sugerencia.media_type === "tv" ? "Serie" : "Película",
    proximo_episodio: null,
    plataformas: [],
    imagen: sugerencia.poster_path ? BASE_IMG + sugerencia.poster_path : null,
    sinopsis: sugerencia.overview || "Sin sinopsis disponible.",
    anio:
      sugerencia.first_air_date?.slice(0, 4) ||
      sugerencia.release_date?.slice(0, 4) ||
      "Desconocido",
    number_of_seasons: sugerencia.number_of_seasons,
  };

  const { error } = await supabase.from("catalogo").insert([nuevo]);

  if (!error) {
    setMensaje({ tipo: "ok", texto: "¡Añadido desde sugerencia!" });
    const { data } = await supabase
      .from("catalogo")
      .select("*")
      .order("creado_en", { ascending: false });
    setCatalogo(data);
    setNuevoItem({
      nombre: "",
      tipo: "Anime",
      proximoEpisodio: "",
      plataformas: "",
    });
    setSugerencias([]);
  } else {
    setMensaje({ tipo: "error", texto: "Error al guardar en Supabase" });
  }

  setTimeout(() => setMensaje({ tipo: "", texto: "" }), 3000);
};

const manejarCambioNombre = async (e) => {
  const nombre = e.target.value;
  setNuevoItem((prev) => ({ ...prev, nombre }));

  if (nombre.length < 3) {
    setSugerencias([]);
    return;
  }

  setCargandoSugerencias(true);

  try {
    const res = await fetch(
      `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(
        nombre
      )}&language=es-ES`
    );
    const data = await res.json();
    const sugerenciasFiltradas = (data.results || []).slice(0, 5); // top 5

    setSugerencias(sugerenciasFiltradas);
  } catch (error) {
    console.error("Error al buscar sugerencias:", error);
  }

  setCargandoSugerencias(false);
};

function Dashboard() {
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [catalogo, setCatalogo] = useState(mediaData);
  const [modoReducido, setModoReducido] = useState(() => {
    const guardado = localStorage.getItem("modoReducido");
    return guardado === "true"; // convierte string a boolean
  });
  const [seleccionando, setSeleccionando] = useState(null); // ID del ítem a completar
  const [resultadosTMDB, setResultadosTMDB] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const [nuevoItem, setNuevoItem] = useState({});

  useEffect(() => {
    const cargarCatalogo = async () => {
      const { data, error } = await supabase
        .from("catalogo")
        .select("*")
        .order("creado_en", { ascending: false });
      if (error) {
        console.error("Error al cargar el catálogo:", error);
      } else {
        console.log("Datos cargados desde la BD:", data);
        setCatalogo(data);
      }
    };

    cargarCatalogo();
  }, []);

  useEffect(() => {
    localStorage.setItem("modoReducido", modoReducido);
  }, [modoReducido]);

  const agregarContenidoAlCatalogo = async (usuario, datosTMDb) => {
    // Paso 1: Insertar en tabla `contenido` si no existe
    const { data: existente } = await supabase
      .from("contenido")
      .select("id")
      .eq("id", datosTMDb.id)
      .maybeSingle();

    if (!existente) {
      await supabase.from("contenido").insert([
        {
          id: datosTMDb.id,
          nombre: datosTMDb.title || datosTMDb.name,
          tipo: datosTMDb.media_type === "tv" ? "Serie" : "Película",
          sinopsis: datosTMDb.overview,
          anio:
            datosTMDb.first_air_date?.slice(0, 4) ||
            datosTMDb.release_date?.slice(0, 4),
          imagen: datosTMDb.poster_path
            ? `https://image.tmdb.org/t/p/w500${datosTMDb.poster_path}`
            : null,
        },
      ]);
    }

    // Paso 2: Insertar en `catalogo_usuario`
    const { error } = await supabase.from("catalogo_usuario").insert([
      {
        user_id: usuario.id,
        contenido_id: datosTMDb.id,
        plataformas: [],
        favorito: false,
      },
    ]);

    if (error) {
      console.error("Error al añadir al catálogo:", error);
    }
  };
  const obtenerCatalogoUsuario = async (usuarioId) => {
    const { data, error } = await supabase
      .from("catalogo_usuario")
      .select("*, contenido(*)")
      .eq("user_id", usuarioId)
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error al obtener catálogo:", error);
      return [];
    }

    return data.map((item) => ({
      ...item.contenido,
      favorito: item.favorito,
      plataformas: item.plataformas,
      proximo_episodio: item.proximo_episodio,
      id_catalogo: item.id,
    }));
  };

  const marcarEpisodioComoVisto = async (userId, episodioId) => {
    await supabase.from("episodios_vistos").upsert([
      {
        user_id: userId,
        episodio_id: episodioId,
        visto: true,
      },
    ]);
  };

  const obtenerEpisodiosVistos = async (userId, contenidoId) => {
    const { data, error } = await supabase
      .from("episodios_vistos")
      .select("episodio_id, episodios(*)")
      .eq("user_id", userId)
      .in(
        "episodio_id",
        supabase.from("episodios").select("id").eq("contenido_id", contenidoId)
      );

    if (error) {
      console.error("Error al obtener episodios vistos:", error);
      return [];
    }

    return data.map((r) => r.episodios);
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <div className="max-w-6xl mx-auto p-6 relative pt-20">
          <h1 className="text-4xl font-bold text-center mb-8">
            🎬 Catálogo Multimedia
          </h1>
          {mensaje.texto && (
            <div
              className={`mb-4 p-3 rounded text-sm ${
                mensaje.tipo === "ok"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {mensaje.texto}
            </div>
          )}
          <form
            onSubmit={agregarNuevoItem}
            className="flex-auto bg-white p-4 rounded-lg shadow mb-6 gap-2"
          >
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={nuevoItem.nombre}
              onChange={manejarCambioNombre}
              className="p-2 border rounded w-full"
            />
            <section className="flex relative flex-col gap-2">
              {cargandoSugerencias && (
                <p className="text-sm text-gray-500">Buscando sugerencias...</p>
              )}

              {sugerencias.length > 0 && (
                <ul className="border rounded bg-white mt-1 max-h-60 overflow-y-auto shadow z-10 relative pt-20">
                  {sugerencias.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => agregarDesdeSugerencia(s)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      {s.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w45${s.poster_path}`}
                          alt="img"
                          className="w-8 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold">
                          {s.title || s.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.release_date || s.first_air_date || "Sin fecha"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </form>

          {/* Filtros */}
          <section className="flex flex-col sm:flex-row gap-4 mb-6 mt-8">
            <select
              className="p-2 border rounded w-full sm:w-1/3 bg-white"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="Anime">Anime</option>
              <option value="Serie">Serie</option>
              <option value="Película">Película</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Buscar por nombre..."
              className="p-2 border rounded w-full sm:flex-1 bg-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button
              onClick={() => setModoReducido(!modoReducido)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {modoReducido ? "🔎 Lista" : "🖼️ Bloque"}
            </button>
          </section>

          {/* ...campos... */}

          {incompleto && (
            <section className="p-4 bg-white shadow rounded mb-4">
              <button
                onClick={completarCatalogo}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                🔄 Completar catálogo
              </button>
              <button
                onClick={completarIdTMDb}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                🔄 Completar IDs de TMDb
              </button>
            </section>
          )}

          {/* Lista */}
          {dataFiltrada.length === 0 ? (
            <p className="text-center text-gray-500">
              No se encontraron resultados.
            </p>
          ) : (
            dataFiltrada.map((item) => (
              <>
                <MediaCard
                  id={item.id}
                  nombre={item.nombre}
                  tipo={item.tipo}
                  plataformas={item.plataformas}
                  imagen={item.imagen}
                  sinopsis={item.sinopsis}
                  anio={item.anio}
                  proximoEpisodio={item.proximo_episodio}
                  esFavorito={item.favorito}
                  toggleFavorito={() =>
                    actualizarItem(item.id, { favorito: !item.favorito })
                  }
                  eliminar={() => eliminarItem(item.id)}
                  actualizarItem={actualizarItem}
                  modoReducido={modoReducido}
                  forzarActualizacionItem={() => forzarActualizacionItem(item)}
                />
              </>
            ))
          )}
        </div>
        {seleccionando && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start p-8 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
              <h2 className="text-lg font-bold mb-4">
                Selecciona el contenido correcto para: {seleccionando.nombre}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {resultadosTMDB.map((r) => (
                  <div
                    key={r.id}
                    className="border p-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => guardarSeleccionTMDB(r)}
                  >
                    {r.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${r.poster_path}`}
                        alt={r.title || r.name}
                        className="mb-2 w-full object-cover rounded"
                      />
                    )}
                    <p className="text-sm font-semibold">{r.title || r.name}</p>
                    <p className="text-xs text-gray-600">
                      {r.first_air_date || r.release_date || "Sin fecha"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.overview}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSeleccionando(null);
                  setResultadosTMDB([]);
                }}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default Dashboard;
