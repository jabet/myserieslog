import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");
  const [usuario, setUsuario] = useState(null);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (data?.idioma_preferido) setIdiomaPreferido(data.idioma_preferido);
      }
    });
  }, []);

  useEffect(() => {
    if (query.length < 2) return setResultados([]);

    const buscar = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResultados(data.results || []);
    };

    const timeout = setTimeout(buscar, 400);
    return () => clearTimeout(timeout);
  }, [query, idiomaPreferido]);

  const seleccionar = async (item) => {
    const detalleUrl = `https://api.themoviedb.org/3/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`;
    const detalle = await fetch(detalleUrl).then((res) => res.json());

    await supabase.from("contenido").upsert([
      {
        id: item.id,
        tipo: item.media_type === "tv" ? "Serie" : "Película",
        anio:
          detalle.first_air_date?.slice(0, 4) ||
          detalle.release_date?.slice(0, 4) ||
          null,
        imagen: detalle.poster_path
          ? `https://image.tmdb.org/t/p/w500${detalle.poster_path}`
          : null,
      },
    ]);

    await supabase.from("contenido_traducciones").upsert([
      {
        contenido_id: item.id,
        idioma: idiomaPreferido,
        nombre: detalle.name || detalle.title,
        sinopsis: detalle.overview,
      },
    ]);

    if (item.media_type === "tv") {
      for (let temporada = 1; temporada <= (detalle.number_of_seasons || 1); temporada++) {
        const episodiosRes = await fetch(
          `https://api.themoviedb.org/3/tv/${item.id}/season/${temporada}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
        );
        const episodiosData = await episodiosRes.json();

        if (Array.isArray(episodiosData.episodes)) {
          const episodiosInsert = episodiosData.episodes.map((ep) => ({
            contenido_id: item.id,
            temporada: temporada,
            episodio: ep.episode_number,
            fecha_emision: ep.air_date,
            imagen: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
          }));

          const { data: episodiosGuardados } = await supabase
            .from("episodios")
            .upsert(episodiosInsert, {
              onConflict: "contenido_id,temporada,episodio",
              returning: "representation"
            });

          if (Array.isArray(episodiosGuardados)) {
            const traducciones = episodiosGuardados.map((ep, idx) => {
              const tmdbEp = episodiosData.episodes.find(e => e.episode_number === ep.episodio);
              return {
                episodio_id: ep.id,
                idioma: idiomaPreferido,
                nombre: tmdbEp?.name || "",
              };
            });

            await supabase.from("episodio_traducciones").upsert(traducciones, {
              onConflict: "episodio_id,idioma"
            });
          }
        }
      }
    }

    navigate(`/detalle/${item.id}`);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        className="border rounded px-3 py-1 w-full bg-white text-gray-500"
        placeholder="Buscar series o películas..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {resultados.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-96 overflow-y-auto shadow">
          {resultados.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 border-b cursor-pointer"
              onClick={() => seleccionar(item)}
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                  alt={item.name || item.title}
                  className="w-12 h-18 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-200 rounded" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 ">
                  {item.name || item.title}
                </p>
                <p className="text-xs text-gray-500">
                  {item.first_air_date?.slice(0, 4) ||
                    item.release_date?.slice(0, 4) ||
                    ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
