import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { actualizarContenido } from "../utils/actualizarContenido";
import { actualizarTraducciones } from "../utils/actualizarTraducciones";
import { cargarTemporadasCapitulos } from "../utils/cargarTemporadasCapitulos";
import { actualizarDuracionEpisodios } from "../utils/actualizarDuracionEpisodios";
import { actualizarDuracionPelicula } from "../utils/actualizarDuracionPeliculas";
import { migrarTodasLasDuraciones } from "../utils/migrarDuraciones";
import {
  actualizarGeneros,
  migrarTodosLosGeneros,
} from "../utils/actualizarGeneros";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";
import Papa from "papaparse";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({});
  const [contenidos, setContenidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Nuevo estado para usuarios
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [vistaActual, setVistaActual] = useState("contenidos"); // Estado para la vista actual

  // Estados para duraciones
  const [migrandoDuraciones, setMigrandoDuraciones] = useState(false);
  const [resultadoMigracion, setResultadoMigracion] = useState(null);

  // Estados para géneros
  const [migrandoGeneros, setMigrandoGeneros] = useState(false);
  const [resultadoMigracionGeneros, setResultadoMigracionGeneros] =
    useState(null);

  // Nuevos estados para búsqueda y filtro
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busquedaId, setBusquedaId] = useState(""); // Nuevo estado para búsqueda por ID

  // Estados para paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 25;

  // Mueve esta línea aquí, antes de usarla:
  const contenidosFiltrados = contenidos.filter(
    (c) =>
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroTipo ? c.media_type === filtroTipo : true) &&
      (busquedaId === "" || String(c.id).includes(busquedaId))
  );

  const totalPaginas = Math.ceil(contenidosFiltrados.length / porPagina);

  // Estado para logs de migración
  const [logsMigracion, setLogsMigracion] = useState([]);

  // 1) Cargar sesión y perfil (incluye role)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setPerfil(data || {}));
      }
    });
  }, []);

  // 2) Cargar lista de contenidos
  useEffect(() => {
    if (!user || perfil.role !== "admin") return;
    setLoading(true);
    supabase
      .from("contenido")
      .select(
        "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
      )
      .order(sortBy, { ascending: sortDir === "asc" })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar contenidos:", error);
        } else {
          setContenidos(data || []);
        }
        setLoading(false);
      });
  }, [user, perfil.role, sortBy, sortDir]);

  // Cargar lista de usuarios
  useEffect(() => {
    if (!user || perfil.role !== "admin") return;
    setLoading(true);
    supabase
      .from("usuarios")
      .select("id, role") // Quita created_at si no existe
      .order(sortBy, { ascending: sortDir === "asc" })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar usuarios:", error);
        } else {
          setUsuarios(data || []);
        }
        setLoading(false);
      });
  }, [user, perfil.role, sortBy, sortDir, vistaActual]);

  // Formatea fecha en DD/MM/AAAA HH:MM
  const formatearFecha = (iso) =>
    iso
      ? new Date(iso).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "-";

  const mostrarMensaje = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  // Forzar actualización de un contenido
  const handleActualizar = async (id, media_type) => {
    const contenido = contenidos.find((c) => c.id === id);
    if (!contenido) return;

    // Actualiza solo el nombre si ha cambiado
    const { error } = await supabase
      .from("contenido")
      .update({ nombre: contenido.nombre })
      .eq("id", id)
      .eq("media_type", media_type);

    if (error) {
      mostrarMensaje(`Fallo al actualizar ${id}`);
    } else {
      mostrarMensaje(`Contenido ${id} actualizado con éxito`);
      // Opcional: refrescar la fecha de actualización
      const { data: updated, error: err2 } = await supabase
        .from("contenido")
        .select("ultima_actualizacion")
        .eq("id", id)
        .single();
      if (!err2 && updated) {
        setContenidos((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, ultima_actualizacion: updated.ultima_actualizacion }
              : c
          )
        );
      }
    }
  };

  // Forzar actualización de traducciones
  const handleActualizarTraducciones = async (id, media_type) => {
    console.log("Actualizando traducciones:", id, media_type);
    const ok = await actualizarTraducciones(id, media_type);
    if (ok) {
      mostrarMensaje(`Traducciones de ${id} actualizadas con éxito`);
    } else {
      mostrarMensaje(`Fallo al actualizar traducciones de ${id}`);
    }
  };

  // Forzar carga de temporadas y capítulos (solo para series)
  const handleCargarTemporadas = async (id, media_type) => {
    console.log("Cargar temporadas/capítulos:", id, media_type);
    if (media_type !== "tv") return;
    const ok = await cargarTemporadasCapitulos(id, "es-ES");
    if (ok) {
      mostrarMensaje(`Temporadas y capítulos de ${id} cargados con éxito`);
    } else {
      mostrarMensaje(`Fallo al cargar temporadas/capítulos de ${id}`);
    }
  };

  // Forzar actualización de TODAS las temporadas y capítulos (solo para series)
  const handleForzarActualizarTemporadas = async (id, media_type) => {
    console.log(
      "Forzar actualización de todas las temporadas:",
      id,
      media_type
    );
    if (media_type !== "tv") return;
    mostrarMensaje("Forzando actualización de todas las temporadas...");
    const ok = await cargarTemporadasCapitulos(id, "es-ES");
    if (ok) {
      mostrarMensaje(
        `Temporadas y capítulos de ${id} actualizados en Supabase`
      );
    } else {
      mostrarMensaje(`Fallo al actualizar temporadas/capítulos de ${id}`);
    }
  };

  // Borrar contenido de la BD
  const handleEliminar = async (id) => {
    console.log("Eliminando contenido:", id);
    if (!confirm(`¿Seguro que quieres borrar el contenido ${id}?`)) return;
    const { error } = await supabase.from("contenido").delete().eq("id", id);
    if (error) {
      console.error("Error borrando contenido:", error);
      mostrarMensaje(`Error al borrar contenido ${id}`);
    } else {
      setContenidos((prev) => prev.filter((c) => c.id !== id));
      mostrarMensaje(`Contenido ${id} borrado`);
    }
  };

  // Cambia el orden de la tabla
  const handleSort = (campo) => {
    if (sortBy === campo) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(campo);
      setSortDir("asc");
    }
  };

  // Icono de orden
  const sortIcon = (campo) =>
    sortBy === campo ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  // NUEVA función para actualizar duraciones
  const handleActualizarDuraciones = async (id, media_type) => {
    if (media_type !== "tv") {
      mostrarMensaje("Solo se pueden actualizar duraciones de series");
      return;
    }

    mostrarMensaje("Actualizando duraciones de episodios...");
    const exito = await actualizarDuracionEpisodios(id, "es-ES");

    if (exito) {
      mostrarMensaje(`Duraciones de episodios de ${id} actualizadas`);
    } else {
      mostrarMensaje(`Error al actualizar duraciones de ${id}`);
    }
  };

  // NUEVA función para actualizar duraciones de películas
  const handleActualizarDuracionPelicula = async (id, media_type) => {
    if (media_type !== "movie") {
      mostrarMensaje("Solo se pueden actualizar duraciones de películas");
      return;
    }

    mostrarMensaje("Actualizando duración de película...");
    const exito = await actualizarDuracionPelicula(id, "es-ES");

    if (exito) {
      mostrarMensaje(`Duración de película ${id} actualizada`);
    } else {
      mostrarMensaje(`Error al actualizar duración de ${id}`);
    }
  };

  // AÑADIR FUNCIÓN PARA ACTUALIZAR GÉNEROS INDIVIDUALES:
  const handleActualizarGeneros = async (id, media_type) => {
    mostrarMensaje("Actualizando géneros...");
    const exito = await actualizarGeneros(id, media_type, "es-ES");

    if (exito) {
      mostrarMensaje(`Géneros de ${media_type} ${id} actualizados`);

      // REEMPLAZAR cargarContenidos() por este código:
      setLoading(true);
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
      } else {
        setContenidos(data || []);
      }
      setLoading(false);
    } else {
      mostrarMensaje(`Error al actualizar géneros de ${id}`);
    }
  };

  // AÑADIR ESTA FUNCIÓN QUE FALTA:
  const handleMigrarDuraciones = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres migrar las duraciones de todas las series y películas? Esto puede tardar varios minutos."
      )
    ) {
      return;
    }

    setMigrandoDuraciones(true);
    setResultadoMigracion(null);
    mostrarMensaje("Iniciando migración de duraciones...");

    try {
      const resultado = await migrarTodasLasDuraciones(setLogsMigracion);
      setResultadoMigracion(resultado);
      mostrarMensaje(
        `✅ Migración completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );
    } catch (error) {
      console.error("Error en migración:", error);
      mostrarMensaje("❌ Error durante la migración");
      setResultadoMigracion({ error: error.message });
    } finally {
      setMigrandoDuraciones(false);
    }
  };

  // AÑADIR TAMBIÉN ESTA FUNCIÓN PARA GÉNEROS:
  const handleMigrarGeneros = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres migrar los géneros de todo el contenido? Esto puede tardar varios minutos."
      )
    ) {
      return;
    }

    setMigrandoGeneros(true);
    setResultadoMigracionGeneros(null);
    mostrarMensaje("Iniciando migración de géneros...");

    try {
      const resultado = await migrarTodosLosGeneros();
      setResultadoMigracionGeneros(resultado);
      mostrarMensaje(
        `✅ Migración de géneros completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );

      // REEMPLAZAR cargarContenidos() por este código:
      setLoading(true);
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
      } else {
        setContenidos(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error en migración de géneros:", error);
      mostrarMensaje("❌ Error durante la migración de géneros");
      setResultadoMigracionGeneros({ error: error.message });
    } finally {
      setMigrandoGeneros(false);
    }
  };

  // Añadir esta función antes de las otras funciones:
  const cargarContenidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
        mostrarMensaje("Error cargando contenidos");
      } else {
        setContenidos(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Añadir función para limpiar contenido no válido:
  const handleLimpiarContenidoInvalido = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar el contenido marcado como 'No disponible' en TMDb?"
      )
    ) {
      return;
    }

    const { data, error } = await supabase
      .from("contenido")
      .delete()
      .contains("generos", ["No disponible"]);

    if (error) {
      console.error("Error eliminando contenido inválido:", error);
      mostrarMensaje("Error al eliminar contenido inválido");
    } else {
      mostrarMensaje(`${data?.length || 0} elementos inválidos eliminados`);
      cargarContenidos(); // Recargar lista
    }
  };

  // Filtra los contenidos según la búsqueda y el tipo
  const contenidosPagina = contenidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const handleExportar = () => {
    const csv = Papa.unparse(contenidos);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contenidos.csv";
    a.click();
  };

  const [seleccionados, setSeleccionados] = useState([]);

  if (!user) return null;
  if (perfil.role !== "admin")
    return (
      <>
        <Navbar />
        <main className="pt-20 px-4 text-center">
          <MensajeFlotante texto="Acceso denegado: solo admins." />
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <MensajeFlotante texto={mensaje} />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

        {/* NUEVO: Tabs para cambiar entre Contenidos y Usuarios */}
        <div className="mb-4">
          <button
            onClick={() => setVistaActual("contenidos")}
            className={`px-4 py-2 rounded-l-lg font-medium transition-all ${
              vistaActual === "contenidos"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📺 Contenidos
          </button>
          <button
            onClick={() => setVistaActual("usuarios")}
            className={`px-4 py-2 rounded-r-lg font-medium transition-all ${
              vistaActual === "usuarios"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👥 Usuarios
          </button>
        </div>

        {loading ? (
          <p>
            Cargando {vistaActual === "contenidos" ? "contenidos" : "usuarios"}…
          </p>
        ) : vistaActual === "contenidos" ? (
          contenidos.length === 0 ? (
            <p>No hay contenidos en la base de datos.</p>
          ) : (
            <>
              {/* NUEVAS INPUTS PARA FILTRAR Y BUSCAR */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Todos los tipos</option>
                  <option value="movie">Película</option>
                  <option value="tv">Serie</option>
                  <option value="anime">Anime</option>
                </select>
                {/* NUEVO: Input para buscar por ID */}
                <input
                  type="text"
                  placeholder="Buscar por ID..."
                  value={busquedaId}
                  onChange={(e) => setBusquedaId(e.target.value)}
                  className="border px-2 py-1 rounded w-24"
                />
              </div>

              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">
                      <input
                        type="checkbox"
                        checked={
                          seleccionados.length > 0 &&
                          seleccionados.length === contenidosPagina.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeleccionados(contenidosPagina.map((c) => c.id));
                          } else {
                            setSeleccionados([]);
                          }
                        }}
                      />
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      ID{sortIcon("id")}
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("nombre")}
                    >
                      Nombre{sortIcon("nombre")}
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("tipo")}
                    >
                      Tipo{sortIcon("tipo")}
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("anio")}
                    >
                      Año{sortIcon("anio")}
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("finalizada")}
                    >
                      Finalizada{sortIcon("finalizada")}
                    </th>
                    <th
                      className="border px-2 py-1 cursor-pointer"
                      onClick={() => handleSort("ultima_actualizacion")}
                    >
                      Última Actualización{sortIcon("ultima_actualizacion")}
                    </th>
                    <th className="border px-2 py-1">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contenidosPagina.map((c) => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeleccionados((prev) => [...prev, c.id]);
                            } else {
                              setSeleccionados((prev) =>
                                prev.filter((id) => id !== c.id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="border px-2 py-1">{c.id}</td>
                      <td className="border px-2 py-1">
                        <a
                          href={`/contenido/${c.id}`}
                          className="text-blue-700 underline hover:text-blue-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {c.nombre || (
                            <span className="text-gray-400 italic">
                              Sin nombre
                            </span>
                          )}
                        </a>
                      </td>
                      <td className="border px-2 py-1">{c.media_type}</td>
                      <td className="border px-2 py-1">{c.anio}</td>
                      <td className="border px-2 py-1">
                        {c.finalizada ? "Sí" : "No"}
                      </td>
                      <td className="border px-2 py-1">
                        {formatearFecha(c.ultima_actualizacion)}
                      </td>
                      <td className="border px-2 py-1 space-x-2">
                        <button
                          onClick={() => handleActualizar(c.id, c.media_type)}
                          className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Actualizar contenido
                        </button>
                        <button
                          onClick={() =>
                            handleActualizarTraducciones(c.id, c.media_type)
                          }
                          className="text-sm bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                        >
                          Actualizar traducciones
                        </button>
                        {c.media_type === "tv" && (
                          <>
                            <button
                              onClick={() =>
                                handleCargarTemporadas(c.id, c.media_type)
                              }
                              className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Cargar temporadas/capítulos
                            </button>
                            <button
                              onClick={() =>
                                handleForzarActualizarTemporadas(
                                  c.id,
                                  c.media_type
                                )
                              }
                              className="text-sm bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                            >
                              Forzar actualización temporadas
                            </button>
                            <button
                              onClick={() =>
                                handleActualizarDuraciones(c.id, c.media_type)
                              }
                              className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                              title="Actualizar duraciones"
                            >
                              ⏱️ Duraciones
                            </button>
                          </>
                        )}
                        {c.media_type === "movie" && (
                          <button
                            onClick={() =>
                              handleActualizarDuracionPelicula(
                                c.id,
                                c.media_type
                              )
                            }
                            className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                            title="Actualizar duración"
                          >
                            🎬 Duración
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(c.id)}
                          className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Borrar contenido
                        </button>
                        <button
                          onClick={() =>
                            handleActualizarGeneros(c.id, c.media_type)
                          }
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          title="Actualizar géneros"
                        >
                          🎭 Géneros
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Controles de paginación */}
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina(pagina - 1)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Anterior
                </button>
                <span>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(pagina + 1)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Siguiente
                </button>
              </div>

              {seleccionados.length > 0 && (
                <div className="my-4 flex gap-2 items-center">
                  <span>{seleccionados.length} seleccionados</span>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={async () => {
                      if (
                        !confirm(
                          `¿Seguro que quieres borrar ${seleccionados.length} contenidos?`
                        )
                      )
                        return;
                      setLoading(true);
                      const { error } = await supabase
                        .from("contenido")
                        .delete()
                        .in("id", seleccionados);
                      if (error) {
                        mostrarMensaje(
                          "Error al borrar contenidos seleccionados"
                        );
                      } else {
                        setContenidos((prev) =>
                          prev.filter((c) => !seleccionados.includes(c.id))
                        );
                        setSeleccionados([]);
                        mostrarMensaje("Contenidos borrados correctamente");
                      }
                      setLoading(false);
                    }}
                  >
                    Borrar seleccionados
                  </button>
                </div>
              )}
            </>
          )
        ) : (
          // Vista de usuarios
          <>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    ID{sortIcon("id")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email{sortIcon("email")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    Fecha de Creación{sortIcon("created_at")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    Rol{sortIcon("role")}
                  </th>
                  <th className="border px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="border px-2 py-1">{u.id}</td>
                    <td className="border px-2 py-1">{u.email}</td>
                    <td className="border px-2 py-1">
                      {formatearFecha(u.created_at)}
                    </td>
                    <td className="border px-2 py-1">{u.role}</td>
                    <td className="border px-2 py-1 space-x-2">
                      <button
                        onClick={() => handleEliminar(u.id)}
                        className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Borrar usuario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* NUEVA SECCIÓN: Migración de Datos */}
        <section className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-yellow-800">
              🚀 Migración de Datos
            </h2>
            {migrandoDuraciones && (
              <div className="flex items-center gap-2 text-yellow-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">
                Actualizar Duraciones de Episodios
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Actualiza las duraciones de todos los episodios existentes desde
                TMDb. Esto puede tardar varios minutos dependiendo del número de
                series.
              </p>

              <button
                onClick={handleMigrarDuraciones}
                disabled={migrandoDuraciones}
                className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                  migrandoDuraciones
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {migrandoDuraciones ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    Migrando duraciones...
                  </>
                ) : (
                  <>
                    <span className="mr-2">⏱️</span>
                    Migrar Duraciones
                  </>
                )}
              </button>
            </div>

            {/* Mostrar resultado de la migración */}
            {resultadoMigracion && (
              <div
                className={`p-4 rounded-lg ${
                  resultadoMigracion.error
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    resultadoMigracion.error ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {resultadoMigracion.error
                    ? "❌ Error en la migración"
                    : "✅ Migración completada"}
                </h4>

                {resultadoMigracion.error ? (
                  <p className="text-red-700 text-sm">
                    {resultadoMigracion.error}
                  </p>
                ) : (
                  <div className="text-green-700 text-sm space-y-1">
                    <p>
                      <strong>Total de series procesadas:</strong>{" "}
                      {resultadoMigracion.total}
                    </p>
                    <p>
                      <strong>Actualizaciones exitosas:</strong>{" "}
                      {resultadoMigracion.exitosos}
                    </p>
                    <p>
                      <strong>Errores:</strong> {resultadoMigracion.fallidos}
                    </p>

                    {resultadoMigracion.fallidos > 0 && (
                      <p className="text-yellow-600">
                        ⚠️ Revisa la consola para ver detalles de los errores
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Información adicional */}
            <div className="text-xs text-yellow-600 space-y-1">
              <p>• Esta operación consultará la API de TMDb para cada serie</p>
              <p>
                • Se aplicará un retraso de 250ms entre consultas para respetar
                los límites de la API
              </p>
              <p>
                • Los logs detallados se mostrarán en la consola del navegador
              </p>
            </div>
          </div>
        </section>

        {/* NUEVA SECCIÓN: Migración de Géneros */}
        <section className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-800">
              🎭 Migración de Géneros
            </h2>
            {migrandoGeneros && (
              <div className="flex items-center gap-2 text-green-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-green-800 mb-2">
                Actualizar Géneros desde TMDb
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Actualiza los géneros de todo el contenido que no tenga géneros
                asignados desde TMDb.
              </p>

              <button
                onClick={handleMigrarGeneros}
                disabled={migrandoGeneros}
                className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                  migrandoGeneros
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {migrandoGeneros ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    Migrando géneros...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎭</span>
                    Migrar Géneros
                  </>
                )}
              </button>
            </div>

            {/* Mostrar resultado de la migración de géneros */}
            {resultadoMigracionGeneros && (
              <div
                className={`p-4 rounded-lg ${
                  resultadoMigracionGeneros.error
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    resultadoMigracionGeneros.error
                      ? "text-red-800"
                      : "text-green-800"
                  }`}
                >
                  {resultadoMigracionGeneros.error
                    ? "❌ Error en la migración"
                    : "✅ Migración completada"}
                </h4>

                {resultadoMigracionGeneros.error ? (
                  <p className="text-red-700 text-sm">
                    {resultadoMigracionGeneros.error}
                  </p>
                ) : (
                  <div className="text-green-700 text-sm space-y-1">
                    <p>
                      <strong>Total de elementos procesados:</strong>{" "}
                      {resultadoMigracionGeneros.total}
                    </p>
                    <p>
                      <strong>Actualizaciones exitosas:</strong>{" "}
                      {resultadoMigracionGeneros.exitosos}
                    </p>
                    <p>
                      <strong>Errores:</strong>{" "}
                      {resultadoMigracionGeneros.fallidos}
                    </p>
                    {/* NUEVO: Mostrar contenido no encontrado */}
                    {resultadoMigracionGeneros.noEncontrados > 0 && (
                      <p>
                        <strong>No encontrados en TMDb:</strong>{" "}
                        <span className="text-yellow-600">
                          {resultadoMigracionGeneros.noEncontrados}
                        </span>
                      </p>
                    )}

                    {(resultadoMigracionGeneros.fallidos > 0 ||
                      resultadoMigracionGeneros.noEncontrados > 0) && (
                      <p className="text-yellow-600 mt-2">
                        ⚠️ Revisa la consola para ver detalles
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Mostrar logs de migración */}
        {logsMigracion.length > 0 && (
          <div className="bg-gray-900 text-green-200 p-2 mt-2 rounded max-h-40 overflow-y-auto text-xs">
            {logsMigracion.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        {/* Usa chart.js o similar para mostrar estadísticas arriba del panel */}
      </main>
      <Footer />
    </>
  );
}

const handleEditarCampo = (id, campo, valor) => {
  setContenidos((prev) =>
    prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
  );
};
