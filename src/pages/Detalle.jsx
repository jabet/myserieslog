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
import { LIMITES_PLAN } from "../constants/planes";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import AvisoLimitePlan from "../components/AvisoLimitePlan";

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

  // --- Lógica de límites por plan ---
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
  console.log("Plan del usuario:", plan);
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
          <strong>Tipo:</strong>{" "}
          {item.media_type === "tv"
            ? "Serie"
            : item.media_type === "movie"
              ? "Película"
              : "Desconocido"}
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
          disabled={!enCatalogo && limiteAlcanzado}
        >
          {enCatalogo ? "Eliminar de mi catálogo" : "Añadir a mi catálogo"}
        </button>
        {!enCatalogo && limiteAlcanzado && (
          <AvisoLimitePlan tipo={esSerie ? "series" : "películas"} />
        )}

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
                  onChange={setPlataformas}
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
            onChange={(nueva) => {
              /* lógica para guardar puntuación */
            }}
          />
          <span className="ml-2 text-sm text-gray-700 align-middle">
            {estadoCatalogo?.puntuacion || 0} / 5
          </span>
        </section>
        {mensaje && <MensajeFlotante texto={mensaje} />}

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
