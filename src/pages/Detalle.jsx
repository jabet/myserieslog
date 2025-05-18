import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";

export default function Detalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});
  const [vistos, setVistos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [enCatalogo, setEnCatalogo] = useState(false);
  const [temporal, setTemporal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [idioma, setIdioma] = useState("es");
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.idioma_preferido) setIdioma(data.idioma_preferido);
      }
    });
  }, []);

  useEffect(() => {
    const cargarItem = async () => {
      const { data, error } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (!data) {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=${idioma}`
        );
        const tmdbData = await res.json();
        setItem({
          id: tmdbData.id,
          nombre: tmdbData.name || tmdbData.title,
          tipo: tmdbData.first_air_date ? "Serie" : "Película",
          sinopsis: tmdbData.overview,
          anio:
            tmdbData.first_air_date?.slice(0, 4) ||
            tmdbData.release_date?.slice(0, 4),
          imagen: tmdbData.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
            : null,
        });
        setTemporal(true);
        return;
      }

      const { data: traduccion } = await supabase
        .from("contenido_traducciones")
        .select("sinopsis")
        .eq("contenido_id", data.id)
        .eq("idioma", idioma)
        .maybeSingle();

      setItem({
        ...data,
        sinopsis: traduccion?.sinopsis || "Sin sinopsis disponible",
      });
      setTemporal(false);
    };

    cargarItem();
  }, [id, idioma]);

  useEffect(() => {
    const cargarEstadoCatalogo = async () => {
      if (!usuario || !item) return;

      const { data } = await supabase
        .from("catalogo_usuario")
        .select("*")
        .eq("user_id", usuario.id)
        .eq("contenido_id", item.id)
        .maybeSingle();

      setEnCatalogo(!!data);
    };

    cargarEstadoCatalogo();
  }, [usuario, item]);

  useEffect(() => {
    const cargarEpisodios = async () => {
      if (!item) return;

      const { data: episodios } = await supabase
        .from("episodios")
        .select("*")
        .eq("contenido_id", item.id)
        .order("temporada, episodio");

      const agrupados = episodios.reduce((acc, ep) => {
        if (!acc[ep.temporada]) acc[ep.temporada] = [];
        acc[ep.temporada].push(ep);
        return acc;
      }, {});
      setEpisodiosPorTemporada(agrupados);
    };

    cargarEpisodios();
  }, [item]);

  useEffect(() => {
    const cargarVistos = async () => {
      if (!usuario || !item) return;

      const { data } = await supabase
        .from("episodios_vistos")
        .select("episodio_id")
        .eq("user_id", usuario.id);

      setVistos(data || []);
    };

    cargarVistos();
  }, [usuario, item]);

  const toggleCatalogo = async () => {
    if (!usuario || !item) return;

    if (enCatalogo) {
      await supabase
        .from("catalogo_usuario")
        .delete()
        .eq("user_id", usuario.id)
        .eq("contenido_id", item.id);
      setEnCatalogo(false);
    } else {
      await supabase.from("catalogo_usuario").insert([
        {
          user_id: usuario.id,
          contenido_id: item.id,
          plataformas: [],
          favorito: false,
        },
      ]);
      setEnCatalogo(true);
    }
  };

  const toggleVisto = async (episodioId) => {
    if (!usuario) {
      setMensaje("Inicia sesión para marcar episodios como vistos");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }

    const yaVisto = vistos.some((v) => v.episodio_id === episodioId);

    if (yaVisto) {
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

  if (!item)
    return (
      <p className="mt-10 p-4 mr-auto ml-auto border-b-emerald-800 bg-emerald-200 align-middle text-center text-emerald-800 font-bold max-w-40 border-2 rounded">
        Cargando...
      </p>
    );

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{item.nombre}</h1>
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
        <p className="mb-4">
          <strong>Sinopsis:</strong> {item.sinopsis}
        </p>

        {usuario ? (
          <button
            onClick={toggleCatalogo}
            className={`mt-2 gap-2 px-4 py-2 rounded text-sm ${
              enCatalogo
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {enCatalogo ? "Quitar del catálogo" : "Añadir a mi catálogo"}
          </button>
        ) : (
          <p className="mb-4 text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded">
            🔒 Inicia sesión para añadir esta serie a tu catálogo.
          </p>
        )}

        <MensajeFlotante texto={mensaje} />

        <section className="mt-8">
          <EpisodiosPorTemporada
            datos={episodiosPorTemporada}
            vistos={vistos}
            toggle={toggleVisto}
            idioma={idioma}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
