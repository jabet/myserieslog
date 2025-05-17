import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";

export default function Detalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});
  const [vistos, setVistos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");
  const [temporal, setTemporal] = useState(false);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const [enCatalogo, setEnCatalogo] = useState(false);

  useEffect(() => {
    if (!usuario || !item) return;

    const verificar = async () => {
      const { data } = await supabase
        .from("catalogo_usuario")
        .select("*")
        .eq("user_id", usuario.id)
        .eq("contenido_id", item.id)
        .maybeSingle();

      setEnCatalogo(!!data);
    };

    verificar();
  }, [usuario, item]);

  const toggleCatalogo = async () => {
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

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (data?.idioma_preferido) {
          setIdiomaPreferido(data.idioma_preferido);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!usuario || isNaN(Number(id))) return;

    const cargarItem = async () => {
      const { data: base } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", Number(id))
        .single();

      let { data: traduccion } = await supabase
        .from("contenido_traducciones")
        .select("*")
        .eq("contenido_id", Number(id))
        .eq("idioma", idiomaPreferido)
        .single();

      if (!traduccion) {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
        );
        const tmdbData = await res.json();
        if (tmdbData?.name) {
          traduccion = {
            contenido_id: Number(id),
            idioma: idiomaPreferido,
            nombre: tmdbData.name,
            sinopsis: tmdbData.overview,
          };
          await supabase.from("contenido_traducciones").upsert([traduccion]);
        }
      }

      if (!base || !traduccion) {
        await cargarDesdeTMDb();
        return;
      }

      setItem({
        id: base.id,
        tipo: base.tipo,
        anio: base.anio,
        imagen: base.imagen,
        nombre: traduccion?.nombre || "Sin título",
        sinopsis: traduccion?.sinopsis || "Sin descripción",
      });

      setTemporal(false);
    };

    cargarItem();
  }, [id, usuario, idiomaPreferido]);

  const cargarDesdeTMDb = async () => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
      );
      const tmdbData = await res.json();

      if (!tmdbData || tmdbData.success === false || tmdbData.status_code) {
        console.error(
          "Error desde TMDb:",
          tmdbData.status_message || "No se encontró contenido"
        );
        return;
      }

      setItem({
        id: tmdbData.id,
        tipo: "Serie",
        anio: (tmdbData.first_air_date || "").slice(0, 4),
        imagen: tmdbData.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
          : null,
        nombre: tmdbData.name,
        sinopsis: tmdbData.overview,
      });

      setTemporal(true);
    } catch (err) {
      console.error("Error consultando TMDb:", err);
    }
  };

  useEffect(() => {
    if (!item || !usuario || temporal) return;

    const cargarEpisodios = async () => {
      const { data: episodios } = await supabase
        .from("episodios")
        .select("*, episodio_traducciones(nombre, idioma)")
        .eq("contenido_id", item.id)
        .order("temporada, episodio");

      for (const ep of episodios) {
        const tieneTraduccion = Array.isArray(ep.episodio_traducciones)
          ? ep.episodio_traducciones.find((t) => t.idioma === idiomaPreferido)
          : ep.episodio_traducciones?.idioma === idiomaPreferido;

        if (!tieneTraduccion) {
          const tmdb = await fetch(
            `https://api.themoviedb.org/3/tv/${item.id}/season/${ep.temporada}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
          ).then((r) => r.json());
          const episodioTMDb = tmdb.episodes?.find(
            (e) => e.episode_number === ep.episodio
          );

          if (episodioTMDb?.name) {
            await supabase.from("episodio_traducciones").upsert(
              [
                {
                  episodio_id: ep.id,
                  idioma: idiomaPreferido,
                  nombre: episodioTMDb.name,
                },
              ],
              {
                onConflict: "episodio_id,idioma",
              }
            );
          }
        }
      }

      const agrupados = episodios.reduce((acc, ep) => {
        const nombreTraducido = Array.isArray(ep.episodio_traducciones)
          ? ep.episodio_traducciones.find((t) => t.idioma === idiomaPreferido)
              ?.nombre
          : ep.episodio_traducciones?.nombre;

        const nombre = nombreTraducido || ep.nombre || "Sin título";
        const normalizado = {
          ...ep,
          nombre,
        };
        if (!acc[ep.temporada]) acc[ep.temporada] = [];
        acc[ep.temporada].push(normalizado);
        return acc;
      }, {});

      setEpisodiosPorTemporada(agrupados);

      const { data: vistosData } = await supabase
        .from("episodios_vistos")
        .select("episodio_id")
        .eq("user_id", usuario.id);

      setVistos(vistosData || []);
    };

    cargarEpisodios();
  }, [item, usuario, temporal, idiomaPreferido]);

  const toggleVisto = async (episodioId) => {
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

  if (!item) return <p className="pt-20 p-4">Cargando...</p>;

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
        <button
          onClick={toggleCatalogo}
          className={`mt-2 px-4 py-2 rounded text-sm ${
            enCatalogo
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {enCatalogo ? "Quitar del catálogo" : "Añadir a mi catálogo"}
        </button>
        
        {!temporal ? (
          <EpisodiosPorTemporada
            datos={episodiosPorTemporada}
            vistos={vistos}
            toggle={toggleVisto}
            idioma={idiomaPreferido}
          />
        ) : (
          <p className="mt-4 text-sm text-gray-500 italic">
            Este contenido no está en tu catálogo. Añádelo para ver sus
            episodios.
          </p>
        )}
      </main>
    </>
  );
}
