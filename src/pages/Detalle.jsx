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
import { actualizarProximoEpisodio } from "../utils/calcularProximoEpisodio";
import { cargarTemporadasCapitulos } from "../utils/cargarTemporadasCapitulos";
import { fetchTMDbContent, parseTMDbContent } from "../utils/tmdb";
import { guardarContenidoTMDb } from "../utils/guardarContenidoTMDb";

export default function Detalle() {
  const { media_type, id } = useParams();
  //console.log("Detalle.jsx params:", { media_type, id });
  const { usuario, idioma, esAdmin } = useUsuario();
  const [item, setItem] = useState(null);
  const [enCatalogo, setEnCatalogo] = useState(false);
  const [estadoCatalogo, setEstadoCatalogo] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [vistos, setVistos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [plataformas, setPlataformas] = useState([]);
  const [cargandoTemporadas, setCargandoTemporadas] = useState(false);

  // Hook para obtener detalle de TMDb
  const { detalle: tmdbDetalle } = useTMDBDetalle(id, idioma, media_type);

  // 1) Cargo el contenido y la sinopsis traducida (A)
  useEffect(() => {
    let cancelado = false;
    const cargarItem = async () => {
      // Busca en la tabla de catálogo/caché usando id y tipo
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

  // 2) Estado en catálogo y favorito
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

  // 3) Carga episodios vistos
  useEffect(() => {
    if (!item) {
      setVistos([]);
      return;
    }
    if (item.desdeTMDB) {
      // Si el item viene de TMDb, carga episodios desde la API (usa tu hook o lógica)
      // Ejemplo:
      setVistos([]); // No hay vistos aún
      // Aquí podrías setear episodios/temporadas en un estado si lo necesitas
      return;
    }
    if (!usuario) {
      setVistos([]);
      return;
    }
    // 1. Obtén todos los episodios de la serie actual
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
        // 2. Obtén los episodios vistos del usuario que estén en esta serie
        const { data: vistosData } = await supabase
          .from("episodios_vistos")
          .select("episodio_id")
          .eq("user_id", usuario.id)
          .in("episodio_id", episodiosIds);
        setVistos((vistosData || []).map((v) => v.episodio_id)); // Array de objetos: [{ episodio_id: 123 }, ...]
      });
  }, [usuario, item]);

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  // 4) Añadir / quitar del catálogo
  const toggleCatalogo = async () => {
    if (!usuario || !item) {
      mostrar("Inicia sesión para gestionar tu catálogo");
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
      // 1. Guarda en la tabla de catálogo/caché si no existe
      const { data: existente } = await supabase
        .from("contenido")
        .select("id")
        .eq("id", item.id)
        .eq("media_type", media_type)
        .maybeSingle();

      if (!existente) {
        await guardarContenidoTMDb(id, media_type, "es-ES");
      }

      // 2. Guarda la relación usuario-contenido
      await supabase.from("catalogo_usuario").insert([
        {
          user_id: usuario.id,
          contenido_id: item.id,
          plataformas: [],
          favorito: false,
          estado: "pendiente",
        },
      ]);
      setEnCatalogo(true);
      setEstadoCatalogo({
        estado: "pendiente",
        favorito: false,
        puntuacion: 0,
      });
      setFavorito(false);

      // --- NUEVO: Recarga el item desde Supabase para refrescar episodios ---
      const { data: nuevoItem } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", item.id)
        .eq("media_type", media_type)
        .single();
      if (nuevoItem) setItem(nuevoItem);
    }
  };

  // 5) Cambiar estado (pendiente / viendo / vista)
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

  // 6) Marcar / desmarcar favorito
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

  // 7) Marcar episodio visto / no visto
  const toggleVisto = async (episodioId) => {
    if (!usuario) {
      mostrar("Inicia sesión para marcar episodios");
      return;
    }
    if (!enCatalogo) {
      mostrar("Añade primero la serie a tu catálogo para marcar episodios");
      return;
    }

    // ACTUALIZACIÓN OPTIMISTA: Actualiza el estado local inmediatamente
    const ya = vistos.includes(episodioId);
    if (ya) {
      setVistos((prev) => prev.filter((id) => id !== episodioId));
    } else {
      setVistos((prev) => [...prev, episodioId]);
    }

    try {
      // Operación en la base de datos (en segundo plano)
      if (ya) {
        await supabase
          .from("episodios_vistos")
          .delete()
          .eq("user_id", usuario.id)
          .eq("episodio_id", episodioId);
      } else {
        await supabase.from("episodios_vistos").insert([
          {
            user_id: usuario.id,
            episodio_id: episodioId,
          },
        ]);
      }

      // Actualizar estado de la serie
      const { data: episodios } = await supabase
        .from("episodios")
        .select("id")
        .eq("contenido_id", item.id)
        .neq("temporada", 0);

      if (episodios) {
        const episodiosValidosIds = episodios.map((e) => e.id);
        const totalEpisodios = episodios.length;

        // Recarga los episodios vistos reales tras la operación
        const { data: vistosData } = await supabase
          .from("episodios_vistos")
          .select("episodio_id")
          .eq("user_id", usuario.id)
          .in("episodio_id", episodiosValidosIds);

        const vistosActuales = (vistosData || []).map((v) => v.episodio_id);
        const vistosCount = vistosActuales.length;

        setVistos(vistosActuales);

        if (totalEpisodios > 0 && vistosCount === totalEpisodios) {
          await supabase
            .from("catalogo_usuario")
            .update({ estado: "vista" })
            .eq("user_id", usuario.id)
            .eq("contenido_id", item.id);
          setEstadoCatalogo((prev) => ({ ...prev, estado: "vista" }));
        } else if (vistosCount > 0) {
          await supabase
            .from("catalogo_usuario")
            .update({ estado: "viendo" })
            .eq("user_id", usuario.id)
            .eq("contenido_id", item.id);
          setEstadoCatalogo((prev) => ({ ...prev, estado: "viendo" }));
        } else {
          await supabase
            .from("catalogo_usuario")
            .update({ estado: "pendiente" })
            .eq("user_id", usuario.id)
            .eq("contenido_id", item.id);
          setEstadoCatalogo((prev) => ({ ...prev, estado: "pendiente" }));
        }
      }

      // NUEVO: Recalcular próximo episodio después del cambio
      await actualizarProximoEpisodio(usuario.id, item.id);
    } catch (error) {
      console.error("Error al actualizar episodio:", error);
      // Si hay error, revierte el cambio optimista
      if (ya) {
        setVistos((prev) => [...prev, episodioId]);
      } else {
        setVistos((prev) => prev.filter((id) => id !== episodioId));
      }
      mostrar("Error al actualizar el episodio");
    }
  };

  // 7b) Marcar/desmarcar múltiples episodios
  const toggleMultiplesEpisodios = async (episodiosIds, marcar = true) => {
    if (!usuario || !enCatalogo) return;

    // ACTUALIZACIÓN OPTIMISTA
    if (marcar) {
      setVistos((prev) => [...new Set([...prev, ...episodiosIds])]);
    } else {
      setVistos((prev) => prev.filter((id) => !episodiosIds.includes(id)));
    }

    try {
      // Operaciones en paralelo
      if (marcar) {
        const inserts = episodiosIds
          .filter((id) => !vistos.includes(id)) // Solo insertar los que no están ya marcados
          .map((episodioId) => ({
            user_id: usuario.id,
            episodio_id: episodioId,
          }));

        if (inserts.length > 0) {
          await supabase.from("episodios_vistos").insert(inserts);
        }
      } else {
        await supabase
          .from("episodios_vistos")
          .delete()
          .eq("user_id", usuario.id)
          .in("episodio_id", episodiosIds);
      }

      // Actualizar estado de la serie
      const { data: episodios } = await supabase
        .from("episodios")
        .select("id")
        .eq("contenido_id", item.id)
        .neq("temporada", 0);

      if (episodios) {
        const totalEpisodios = episodios.length;
        const vistosActuales = marcar
          ? [...new Set([...vistos, ...episodiosIds])]
          : vistos.filter((id) => !episodiosIds.includes(id));

        const vistosCount = vistosActuales.filter((id) =>
          episodios.some((ep) => ep.id === id)
        ).length;

        if (totalEpisodios > 0 && vistosCount === totalEpisodios) {
          await supabase
            .from("catalogo_usuario")
            .update({ estado: "vista" })
            .eq("user_id", usuario.id)
            .eq("contenido_id", item.id);
          setEstadoCatalogo((prev) => ({ ...prev, estado: "vista" }));
        } else if (vistosCount > 0) {
          await supabase
            .from("catalogo_usuario")
            .update({ estado: "viendo" })
            .eq("user_id", usuario.id)
            .eq("contenido_id", item.id);
          setEstadoCatalogo((prev) => ({ ...prev, estado: "viendo" }));
        }
      }
    } catch (error) {
      // Revertir cambio optimista en caso de error
      if (marcar) {
        setVistos((prev) => prev.filter((id) => !episodiosIds.includes(id)));
      } else {
        setVistos((prev) => [...new Set([...prev, ...episodiosIds])]);
      }
      mostrar("Error al actualizar los episodios");
    }
  };

  // 8) Guardar puntuación
  const guardarPuntuacion = async (contenidoId, puntuacion) => {
    const { error } = await supabase
      .from("catalogo_usuario")
      .update({ puntuacion })
      .eq("user_id", usuario.id)
      .eq("contenido_id", contenidoId);

    if (error) {
      console.error("Error guardando puntuación:", error);
    } else {
      setEstadoCatalogo((prev) => ({ ...prev, puntuacion }));
    }
  };

  // Nueva función para actualizar plataformas
  const actualizarPlataformas = async (nuevasPlataformas) => {
    if (!usuario || !enCatalogo) {
      mostrar(
        "Añade primero la serie a tu catálogo para seleccionar plataformas"
      );
      return;
    }

    setPlataformas(nuevasPlataformas);

    try {
      await supabase
        .from("catalogo_usuario")
        .update({ plataformas: nuevasPlataformas })
        .eq("user_id", usuario.id)
        .eq("contenido_id", item.id);

      setEstadoCatalogo((prev) => ({
        ...prev,
        plataformas: nuevasPlataformas,
      }));
      mostrar("Plataformas actualizadas");
    } catch (error) {
      console.error("Error al actualizar plataformas:", error);
      mostrar("Error al actualizar plataformas");
    }
  };

  // NUEVO: Efecto para verificar y cargar temporadas
  useEffect(() => {
    const verificarYCargarTemporadas = async () => {
      if (!item || item.media_type !== "tv") return;

      const { data: episodiosExistentes } = await supabase
        .from("episodios")
        .select("id")
        .eq("contenido_id", item.id)
        .limit(1);

      if (
        !episodiosExistentes?.length &&
        ["Serie", "Anime", "Dorama", "K-Drama"].includes(item.tipo)
      ) {
        setCargandoTemporadas(true);
        mostrar("Cargando temporadas desde TMDb...");

        try {
          const exito = await cargarTemporadasCapitulos(item.id, idioma);
          if (exito) {
            mostrar("Temporadas cargadas correctamente");

            // Recargar episodios vistos para el componente EpisodiosPorTemporada
            if (usuario) {
              const { data: episodios } = await supabase
                .from("episodios")
                .select("id")
                .eq("contenido_id", item.id);

              if (episodios) {
                const episodiosIds = episodios.map((e) => e.id);
                const { data: vistosData } = await supabase
                  .from("episodios_vistos")
                  .select("episodio_id")
                  .eq("user_id", usuario.id)
                  .in("episodio_id", episodiosIds);

                setVistos((vistosData || []).map((v) => v.episodio_id));
              }
            }
          } else {
            mostrar("Error al cargar temporadas");
          }
        } catch (error) {
          console.error("Error cargando temporadas:", error);
          mostrar("Error al cargar temporadas");
        } finally {
          setCargandoTemporadas(false);
        }
      }
    };

    verificarYCargarTemporadas();
  }, [item, idioma, usuario]);

  const handleAddToCatalog = async () => {
    if (!usuario || !item) return;

    // 1. Obtener datos completos de TMDb
    const tmdbRaw = await fetchTMDbContent(media_type, id, idioma);
    const tmdbParsed = parseTMDbContent(tmdbRaw, media_type);

    // 2. Guardar todos los datos en Supabase
    await supabase.from("contenido").upsert([
      {
        id: tmdbParsed.id,
        media_type: tmdbParsed.media_type,
        tipo: tmdbParsed.tipo,
        nombre: tmdbParsed.nombre,
        nombre_original: tmdbParsed.nombre_original,
        sinopsis: tmdbParsed.sinopsis,
        imagen: tmdbParsed.imagen,
        backdrop: tmdbParsed.backdrop,
        anio: tmdbParsed.anio,
        fecha_estreno: tmdbParsed.fecha_estreno,
        generos: tmdbParsed.generos,
        puntuacion: tmdbParsed.puntuacion,
        popularidad: tmdbParsed.popularidad,
        duracion: tmdbParsed.duracion,
        temporadas: tmdbParsed.temporadas,
        episodios_totales: tmdbParsed.episodios_totales,
        estado_serie: tmdbParsed.estado_serie,
        en_emision: tmdbParsed.en_emision,
        finalizada: tmdbParsed.finalizada,
        reparto: tmdbParsed.reparto,
        external_ids: tmdbParsed.external_ids,
        original_language: tmdbParsed.original_language,
        origin_country: tmdbParsed.origin_country,
        genre_ids: tmdbParsed.genre_ids,
      },
    ]);

    // 3. Relación usuario-contenido
    await supabase.from("catalogo_usuario").insert([
      {
        user_id: usuario.id,
        contenido_id: tmdbParsed.id,
        plataformas: [],
        favorito: false,
        estado: "pendiente",
      },
    ]);
    // ...resto de tu lógica...
  };

  if (!item) {
    return (
      <>
        <MensajeFlotante texto="Cargando detalle…" />
        <p className="pt-20 p-4 text-center">Cargando detalle…</p>
      </>
    );
  }

  if (!["tv", "movie"].includes(media_type)) {
    // Puedes mostrar un error o intentar inferirlo desde item.tipo si existe
    return;
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
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
                <StarFilledIcon className="w-6 h-6 text-yellow-500" />
              ) : (
                <StarIcon className="w-6 h-6 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {item.imagen && (
          <img
            src={item.imagen}
            alt={item.nombre}
            className="w-64 mb-4 rounded shadow"
          />
        )}

        <p className="mb-2">
          <strong>Año:</strong> {item.anio || "Desconocido"}
        </p>
        <p className="mb-2">
          <strong>Tipo:</strong> {item.tipo || "Desconocido"}
        </p>
        {item.finalizada !== undefined && (
          <p className="mb-2">
            <strong>Estado:</strong>{" "}
            {item.finalizada ? "Finalizada" : "En emisión"}
          </p>
        )}

        <p className="mb-4">
          <strong>Sinopsis:</strong> {item.sinopsis}
        </p>

        <button
          onClick={toggleCatalogo}
          className={`mb-4 px-4 py-2 rounded text-white ${
            enCatalogo
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          aria-label={
            enCatalogo ? "Eliminar de mi catálogo" : "Añadir a mi catálogo"
          }
        >
          {enCatalogo ? "Eliminar de mi catálogo" : "Añadir a mi catálogo"}
        </button>

        {enCatalogo && (
          <div className="mb-4 space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium mr-2">Estado:</label>
                <SelectorEstado
                  estado={estadoCatalogo?.estado}
                  onChange={cambiarEstado}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Plataformas donde la ves:
              </label>
              <div className="max-w-xs">
                <SelectorPlataformas
                  plataformasSeleccionadas={plataformas}
                  onChange={actualizarPlataformas}
                />
              </div>
            </div>

            {plataformas.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {plataformas.map((plataformaId) => {
                    const plataforma = PLATAFORMAS_DISPONIBLES.find(
                      (p) => p.id === plataformaId
                    );
                    const IconComponent = IconosPlataformas[plataformaId];

                    return plataforma ? (
                      <span
                        key={plataforma.id}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border"
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
              </div>
            )}
          </div>
        )}
        <section className="flex items-baseline">
          <Estrellas
            valor={estadoCatalogo?.puntuacion || 0}
            onChange={(nueva) => guardarPuntuacion(item.id, nueva)}
          />
          <span className="ml-2 text-sm text-gray-700 align-middle">
            {estadoCatalogo?.puntuacion || 0} / 5
          </span>
        </section>
        {mensaje && <MensajeFlotante texto={mensaje} />}

        {["Serie", "Anime", "Dorama", "K-Drama"].includes(item.tipo) && !item.desdeTMDB && (
          <section className="mt-8">
            <EpisodiosPorTemporada
              contenidoId={item.id}
              temporadas={item.temporadas}
              vistos={vistos}
              toggle={toggleVisto}
              toggleMultiples={toggleMultiplesEpisodios}
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
