// src/pages/Detalle.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { detectarTipo } from "../utils/tmdbTypeDetector";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";
import SelectorEstado from "../components/SelectorEstado";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";
import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";

export default function Detalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [enCatalogo, setEnCatalogo] = useState(false);
  const [estadoCatalogo, setEstadoCatalogo] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [vistos, setVistos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [idioma, setIdioma] = useState("es");
  const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE = "https://api.themoviedb.org/3";

  // 1) Cargo usuario y preferencias de idioma
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (!user) return;
      const { data: pref } = await supabase
        .from("preferencias_usuario")
        .select("idioma_preferido")
        .eq("user_id", user.id)
        .single();
      if (pref?.idioma_preferido) {
        const lang = pref.idioma_preferido;
        setIdioma(lang.length === 2 ? `${lang}-${lang.toUpperCase()}` : lang);
      }
    });
  }, []);

  // 2) Cargo el contenido y la sinopsis traducida (A)
  useEffect(() => {
    const cargarItem = async () => {
      // 2.1) Intento Supabase
      const { data, error } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (data && !error) {
        let tipo = data.tipo;
        // Si no tengo tipo, detecto con TMDb (omitido aquí por brevedad)
        if (!tipo) {
          // … lógica detectarTipo y actualizar campo tipo …
        }

        // ——— Aquí empieza el bloque (A) ———
        // 2.2) Traigo la traducción para sinopsis (y nombre, si quieres)
        const { data: trad, error: errTrad } = await supabase
          .from("contenido_traducciones")
          .select("nombre, sinopsis")
          .eq("contenido_id", data.id)
          .eq("idioma", idioma)
          .maybeSingle();

        setItem({
          ...data,
          tipo,
          nombre: trad?.nombre || data.nombre,
          sinopsis: trad?.sinopsis || data.sinopsis || "Sin sinopsis.",
        });
        return;
      }
      // ——— Aquí termina el bloque (A) ———

      // 2.3) Fallback completo a TMDb (igual que antes)
      let mediaType = "tv";
      let res = await fetch(
        `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=${idioma}`
      );
      let tmdb = await res.json();
      if (tmdb.success === false) {
        mediaType = "movie";
        res = await fetch(
          `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=${idioma}`
        );
        tmdb = await res.json();
      }
      const tipoDetect = detectarTipo(
        {
          ...tmdb,
          genre_ids: tmdb.genre_ids || tmdb.genres?.map((g) => g.id) || [],
          original_language: tmdb.original_language,
          origin_country: tmdb.origin_country || [],
        },
        mediaType
      );

      setItem({
        id: tmdb.id,
        nombre: tmdb.name || tmdb.title,
        tipo: tipoDetect,
        sinopsis: tmdb.overview || "Sin sinopsis.",
        anio:
          (mediaType === "tv" ? tmdb.first_air_date : tmdb.release_date)?.slice(
            0,
            4
          ) || "Desconocido",
        imagen: tmdb.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
          : null,
        finalizada: mediaType === "tv" ? tmdb.status === "Ended" : true,
      });
    };

    cargarItem();
  }, [id, idioma]);

  // 3) Estado en catálogo y favorito
  useEffect(() => {
    if (!usuario || !item) return;
    supabase
      .from("catalogo_usuario")
      .select("estado, favorito")
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEnCatalogo(true);
          setEstadoCatalogo(data.estado);
          setFavorito(data.favorito);
        }
      });
  }, [usuario, item]);

  // 4) Carga episodios vistos
  useEffect(() => {
    if (!usuario) return;
    supabase
      .from("episodios_vistos")
      .select("episodio_id")
      .eq("user_id", usuario.id)
      .then(({ data }) => setVistos(data || []));
  }, [usuario]);

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  // 5) Añadir / quitar del catálogo
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
      setEstadoCatalogo("pendiente");
    }
  };

  // 6) Cambiar estado (pendiente / viendo / vista)
  const cambiarEstado = async (nuevo) => {
    await supabase
      .from("catalogo_usuario")
      .update({ estado: nuevo })
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id);
    setEstadoCatalogo(nuevo);
    mostrar(
      nuevo === "pendiente"
        ? "Añadida a “Lo quiero ver”"
        : nuevo === "viendo"
          ? "Estado cambiado a “Viéndola”"
          : "Marcada como “Ya la vi”"
    );
  };

  // 7) Marcar / desmarcar favorito
  const toggleFavorito = async () => {
    if (!usuario) {
      mostrar("Inicia sesión para marcar favoritos");
      return;
    }
    const nuevo = !favorito;
    await supabase
      .from("catalogo_usuario")
      .update({ favorito: nuevo })
      .eq("user_id", usuario.id)
      .eq("contenido_id", item.id);
    setFavorito(nuevo);
    mostrar(nuevo ? "Añadido a favoritos" : "Eliminado de favoritos");
  };

  // 8) Marcar episodio visto / no visto
  const toggleVisto = async (episodioId) => {
    if (!usuario) {
      mostrar("Inicia sesión para marcar episodios");
      return;
    }
    const ya = vistos.some((v) => v.episodio_id === episodioId);
    if (ya) {
      await supabase
        .from("episodios_vistos")
        .delete()
        .eq("user_id", usuario.id)
        .eq("episodio_id", episodioId);
    } else {
      await supabase
        .from("episodios_vistos")
        .insert([{ user_id: usuario.id, episodio_id: episodioId }]);
    }
    const { data } = await supabase
      .from("episodios_vistos")
      .select("episodio_id")
      .eq("user_id", usuario.id);
    setVistos(data || []);
  };

  if (!item) return <p className="pt-20 p-4 text-center">Cargando detalle…</p>;

  return (
    <>
      <Navbar />

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-3xl font-bold">{item.nombre}</h1>
          {enCatalogo && (
            <button onClick={toggleFavorito} className="ml-2">
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
          <strong>Año:</strong> {item.anio}
        </p>
        <p className="mb-2">
          <strong>Tipo:</strong> {item.tipo}
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
        >
          {enCatalogo ? "Eliminar de mi catálogo" : "Añadir a mi catálogo"}
        </button>

        {enCatalogo && (
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label className="text-sm font-medium mr-2">Estado:</label>
              <SelectorEstado
                estado={estadoCatalogo}
                onChange={cambiarEstado}
              />
            </div>
          </div>
        )}

        <MensajeFlotante texto={mensaje} />

        {["Serie", "Anime", "Dorama", "K-Drama"].includes(item.tipo) && (
          <section className="mt-8">
            <EpisodiosPorTemporada
              contenidoId={item.id}
              vistos={vistos}
              toggle={toggleVisto}
              idioma={idioma}
            />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
