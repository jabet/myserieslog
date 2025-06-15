import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";
import useUsuario from "../hooks/useUsuario";
import useTMDBDetalle from "../hooks/useTMDBDetalle";
import { IconosPlataformas } from "../components/IconosPlataformas";
import { PLATAFORMAS_DISPONIBLES } from "../constants/plataformas";
import { guardarContenidoTMDb } from "../utils/guardarContenidoTMDb";
import { LIMITES_PLAN } from "../constants/planes";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import AvisoLimitePlan from "../components/AvisoLimitePlan";
import { obtenerLogrosRecientes } from "../utils/logros";
import { notificarLogroDesbloqueado } from "../utils/notificaciones";
import { comprobarYMarcarLogros } from "../utils/comprobarYMarcarLogros"; // Asegúrate de importar
// Importa los componentes agrupados
import { DetalleHeader, DetallePlataformas } from "../components/detalle";

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

      await supabase.from("catalogo_usuario").insert([
        {
          user_id: usuario.id,
          contenido_id: item.id,
          plataformas: [],
          favorito: false,
          estado: "pendiente",
        },
      ]);

      // --- NUEVO: Comprobar y marcar logros tras añadir al catálogo ---
      // Obtén las estadísticas actualizadas del usuario
      const stats = await obtenerStats();
      // Comprueba y marca los logros conseguidos, y notifica
      const nuevosLogros = await comprobarYMarcarLogros(stats, usuario.id);
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
        {/* Cabecera con imagen, título, estrellas, TMDb y favorito */}
        <DetalleHeader
          item={item}
          enCatalogo={enCatalogo}
          favorito={favorito}
          toggleFavorito={toggleFavorito}
          estadoCatalogo={estadoCatalogo}
          cambiarPuntuacion={cambiarPuntuacion}
        />

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <button
            onClick={toggleCatalogo}
            className={`px-6 py-2 rounded font-semibold shadow transition ${
              enCatalogo
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
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
        </div>

        {mensaje && <MensajeFlotante texto={mensaje} />}

        {/* Estado y plataformas */}
        {enCatalogo && (
          <DetallePlataformas
            estadoCatalogo={estadoCatalogo}
            cambiarEstado={cambiarEstado}
            plataformas={plataformas}
            setPlataformas={setPlataformas}
          />
        )}

        {/* Episodios por temporada */}
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
