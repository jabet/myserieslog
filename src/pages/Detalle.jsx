import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";
import SelectorEstado from "../components/SelectorEstado";
import Footer from "../components/Footer";
import Estrellas from "../components/Estrella";
import MensajeFlotante from "../components/MensajeFlotante";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import useUsuario from "../hooks/useUsuario";
import useTMDBDetalle from "../hooks/useTMDBDetalle";
import SelectorPlataformas from "../components/SelectorPlataformas";
import { IconosPlataformas } from "../components/IconosPlataformas";
import { PLATAFORMAS_DISPONIBLES } from "../constants/plataformas";
import { guardarContenidoTMDb } from "../utils/guardarContenidoTMDb";
import { LIMITES_PLAN } from "../constants/planes";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import AvisoLimitePlan from "../components/AvisoLimitePlan";
import { obtenerLogrosRecientes } from "../utils/logros";
import { notificarLogroDesbloqueado } from "../utils/notificaciones";
import PuntuacionTMDb from "../components/PuntuacionTMDb";

export default function Detalle() {
  const { media_type, id } = useParams();
  const { usuario, idioma, plan } = useUsuario();
  const { catalogo } = useCatalogoUsuario(usuario, idioma);
  const [item, setItem] = useState(null);
  const [enCatalogo, setEnCatalogo] = useState(false);
  const [estadoCatalogo, setEstadoCatalogo] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [vistos, setVistos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [plataformas, setPlataformas] = useState([]);
  const [cargandoTemporadas, setCargandoTemporadas] = useState(false);

  const { detalle: tmdbDetalle } = useTMDBDetalle(id, idioma, media_type);

  useEffect(() => {
    let cancelado = false;
    const cargarItem = async () => {
      const { data, error } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", Number(id))
        .eq("media_type", media_type)
        .single();

      if (cancelado) return;

      if (data && !error) {
        const { data: trad } = await supabase
          .from("contenido_traducciones")
          .select("nombre, sinopsis")
          .eq("contenido_id", data.id)
          .eq("idioma", idioma)
          .maybeSingle();

        if (cancelado) return;

        setItem({
          ...data,
          nombre: trad?.nombre || data.nombre,
          sinopsis: trad?.sinopsis || data.sinopsis || "Sin sinopsis.",
        });
      } else if (tmdbDetalle) {
        setItem({ ...tmdbDetalle, desdeTMDB: true });
      }
    };

    cargarItem();
    return () => {
      cancelado = true;
    };
  }, [id, media_type, idioma, tmdbDetalle]);

  useEffect(() => {
    if (!usuario || !item) return;
    supabase
      .from("catalogo_usuario")
      .select("estado, favorito, puntuacion, plataformas")
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnCatalogo(true);
          setEstadoCatalogo(data);
          setFavorito(data.favorito);
          setPlataformas(data.plataformas || []);
        } else {
          setEnCatalogo(false);
          setEstadoCatalogo(null);
          setFavorito(false);
          setPlataformas([]);
        }
      });
  }, [usuario, item]);

  useEffect(() => {
    if (!item) {
      setVistos([]);
      return;
    }
    if (!usuario) {
      setVistos([]);
      return;
    }
    supabase
      .from("episodios")
      .select("id")
      .eq("contenido_id", item.id)
      .then(async ({ data: episodios }) => {
        if (!episodios) {
          setVistos([]);
          return;
        }
        const episodiosIds = episodios.map((e) => e.id);
        const { data: vistosData } = await supabase
          .from("episodios_vistos")
          .select("episodio_id")
          .eq("user_id", usuario.id)
          .in("episodio_id", episodiosIds);
        setVistos((vistosData || []).map((v) => v.episodio_id));
      });
  }, [usuario, item]);

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  if (!item) {
    return (
      <>
        <MensajeFlotante texto="Cargando detalle…" />
        <p className="pt-20 p-4 text-center">Cargando detalle…</p>
      </>
    );
  }

  const seriesEnCatalogo = catalogo.filter((c) => c.media_type === "tv").length;
  const peliculasEnCatalogo = catalogo.filter(
    (c) => c.media_type === "movie"
  ).length;
  const esSerie = item.media_type === "tv";
  const esPelicula = item.media_type === "movie";
  const limiteAlcanzado =
    (esSerie && seriesEnCatalogo >= LIMITES_PLAN[plan]?.series) ||
    (esPelicula && peliculasEnCatalogo >= LIMITES_PLAN[plan]?.peliculas);

  // --- NUEVO: Cálculo y notificación de logros al añadir al catálogo ---
  const obtenerStats = async () => {
    // Aquí deberías obtener las estadísticas del usuario igual que en Perfil.jsx
    // Por ejemplo, contando series, películas, episodios vistos, etc.
    // Este es un ejemplo básico:
    const { data: seriesData } = await supabase
      .from("catalogo_usuario")
      .select("id")
      .eq("user_id", usuario.id)
      .eq("estado", "viendo");
    const { data: peliculasData } = await supabase
      .from("catalogo_usuario")
      .select("id")
      .eq("user_id", usuario.id)
      .eq("estado", "pendiente");
    // ...añade más stats según tus logros...
    return {
      series: { total: seriesData?.length || 0 },
      peliculas: { total: peliculasData?.length || 0 },
      // ...otros stats...
    };
  };

  const toggleCatalogo = async () => {
    if (!usuario || !item) {
      mostrar("Inicia sesión para gestionar tu catálogo");
      return;
    }
    if (!enCatalogo && limiteAlcanzado) {
      mostrar(
        `Has alcanzado el límite de ${esSerie ? "series" : "películas"} para tu plan.`
      );
      return;
    }
    if (enCatalogo) {
      await supabase
        .from("catalogo_usuario")
        .delete()
        .eq("user_id", usuario.id)
        .eq("contenido_id", item.id);
      setEnCatalogo(false);
      setEstadoCatalogo(null);
      setFavorito(false);
    } else {
      const { data: existente } = await supabase
        .from("contenido")
        .select("id")
        .eq("id", item.id)
        .eq("media_type", media_type)
        .maybeSingle();

      if (!existente) {
        await guardarContenidoTMDb(id, media_type, "es-ES");
      }

      // 1. Obtener stats antes de añadir
      const estadisticasAntes = await obtenerStats();

      await supabase.from("catalogo_usuario").insert([
        {
          user_id: usuario.id,
          contenido_id: item.id,
          plataformas: [],
          favorito: false,
          estado: "pendiente",
        },
      ]);

      // 2. Obtener stats después de añadir
      const estadisticasAhora = await obtenerStats();

      // 3. Calcular logros recién desbloqueados
      const nuevosLogros = obtenerLogrosRecientes(
        estadisticasAntes,
        estadisticasAhora
      );
      for (const logro of nuevosLogros) {
        await notificarLogroDesbloqueado(usuario.id, logro);
      }

      setEnCatalogo(true);
      setEstadoCatalogo({
        estado: "pendiente",
        favorito: false,
        puntuacion: 0,
      });
      setFavorito(false);

      const { data: nuevoItem } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", item.id)
        .eq("media_type", media_type)
        .single();
      if (nuevoItem) setItem(nuevoItem);
    }
  };

  const cambiarEstado = async (nuevo) => {
    await supabase
      .from("catalogo_usuario")
      .update({ estado: nuevo })
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id);
    setEstadoCatalogo((prev) => ({ ...prev, estado: nuevo }));
    mostrar(
      nuevo === "pendiente"
        ? "Añadida a “Lo quiero ver”"
        : nuevo === "viendo"
          ? "Estado cambiado a “Viéndola”"
          : "Marcada como “Ya la vi”"
    );
  };

  const toggleFavorito = async () => {
    if (!usuario) {
      mostrar("Inicia sesión para marcar favoritos");
      return;
    }
    if (!enCatalogo) {
      mostrar("Añade primero al catálogo para marcar como favorito");
      return;
    }
    const nuevo = !favorito;
    await supabase
      .from("catalogo_usuario")
      .update({ favorito: nuevo })
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id);
    setFavorito(nuevo);
    setEstadoCatalogo((prev) => ({ ...prev, favorito: nuevo }));
    mostrar(nuevo ? "Añadido a favoritos" : "Eliminado de favoritos");
  };

  const cambiarPuntuacion = async (nueva) => {
    if (!usuario || !enCatalogo) {
      mostrar("Añade primero al catálogo para puntuar");
      return;
    }
    await supabase
      .from("catalogo_usuario")
      .update({ puntuacion: nueva })
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id);
    setEstadoCatalogo((prev) => ({ ...prev, puntuacion: nueva }));
    mostrar(`Puntuación guardada: ${nueva} / 5`);
  };

  // --- DISEÑO MEJORADO ---
  return (
    <>
      <Navbar />
      <main className="pt-24 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-lg p-6 mb-8">
          {item.imagen && (
            <img
              src={item.imagen}
              alt={item.nombre}
              className="w-64 h-96 object-cover rounded-lg shadow-md mx-auto md:mx-0"
            />
          )}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{item.nombre}</h1>
                {enCatalogo && (
                  <button
                    onClick={toggleFavorito}
                    className="ml-2"
                    aria-label={
                      favorito ? "Quitar de favoritos" : "Añadir a favoritos"
                    }
                  >
                    {favorito ? (
                      <StarFilledIcon className="w-7 h-7 text-yellow-500" />
                    ) : (
                      <StarIcon className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mb-4 text-gray-700 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Año:</strong> {item.anio || "Desconocido"}
                </span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  <strong>Tipo:</strong>{" "}
                  {item.tipo ||
                    (item.media_type === "tv" ? "Serie" : "Película")}
                </span>
                {item.finalizada !== undefined && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    <strong>Estado:</strong>{" "}
                    {item.finalizada ? "Finalizada" : "En emisión"}
                  </span>
                )}
              </div>
              <p className="mb-4 text-gray-800">
                <strong>Sinopsis:</strong> {item.sinopsis}
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <button
                onClick={toggleCatalogo}
                className={`px-6 py-2 rounded font-semibold shadow transition ${
                  enCatalogo
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                aria-label={
                  enCatalogo
                    ? "Eliminar de mi catálogo"
                    : "Añadir a mi catálogo"
                }
                disabled={!enCatalogo && limiteAlcanzado}
              >
                {enCatalogo
                  ? "Eliminar de mi catálogo"
                  : "Añadir a mi catálogo"}
              </button>
              {!enCatalogo && limiteAlcanzado && (
                <AvisoLimitePlan tipo={esSerie ? "series" : "películas"} />
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Estrellas
                  valor={estadoCatalogo?.puntuacion || 0}
                  onChange={cambiarPuntuacion}
                />
                <span className="text-sm text-gray-700">
                  {estadoCatalogo?.puntuacion || 0} / 5
                </span>
                <PuntuacionTMDb puntuacion={item.puntuacion} />
              </div>
            </div>
            {mensaje && <MensajeFlotante texto={mensaje} />}
          </div>
        </div>

        {enCatalogo && (
          <div className="mb-8 bg-gray-50 rounded-lg p-6 shadow-inner">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium mr-2">Estado:</label>
                <SelectorEstado
                  estado={estadoCatalogo?.estado}
                  onChange={cambiarEstado}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Plataformas donde la ves:
                </label>
                <SelectorPlataformas
                  plataformasSeleccionadas={plataformas}
                  onChange={setPlataformas}
                />
                {plataformas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {plataformas.map((plataformaId) => {
                      const plataforma = PLATAFORMAS_DISPONIBLES.find(
                        (p) => p.id === plataformaId
                      );
                      const IconComponent = IconosPlataformas[plataformaId];
                      return plataforma ? (
                        <span
                          key={plataforma.id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800 border"
                        >
                          {IconComponent && (
                            <div className="w-4 h-4">
                              <IconComponent />
                            </div>
                          )}
                          {plataforma.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {item.media_type === "tv" && !item.desdeTMDB && (
          <section className="mt-8">
            <EpisodiosPorTemporada
              contenidoId={item.id}
              temporadas={item.temporadas}
              vistos={vistos}
              toggle={() => {}}
              toggleMultiples={() => {}}
              idioma={idioma}
              usuario={usuario}
              enCatalogo={enCatalogo}
            />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
