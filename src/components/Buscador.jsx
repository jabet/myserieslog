import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { detectarTipo } from "../utils/tmdbTypeDetector";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es-ES");
  const [usuario, setUsuario] = useState(null);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();

  // 1) Cargar usuario y su idioma preferido
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data: pref } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (pref?.idioma_preferido) {
          setIdiomaPreferido(
            pref.idioma_preferido.length === 2
              ? `${pref.idioma_preferido}-${pref.idioma_preferido.toUpperCase()}`
              : pref.idioma_preferido
          );
        }
      }
    });
  }, []);

  // 2) Buscar con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?` +
          `api_key=${TMDB_API_KEY}` +
          `&language=${idiomaPreferido}` +
          `&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResultados(data.results || []);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, idiomaPreferido]);

  // 3) Seleccionar un resultado y añadir a Supabase
  const seleccionar = async (item) => {
    if (!item?.id) return;
    // Ver si ya existe en contenido
    const { data: existente } = await supabase
      .from("contenido")
      .select("id")
      .eq("id", item.id)
      .eq("media_type", item.media_type) // Buscar por media_type también
      .maybeSingle();

    if (!existente) {
      // 3.1) Traer datos completos de TMDb
      const mediaType = item.media_type === "tv" ? "tv" : "movie";
      const endpoint = mediaType === "tv" ? "tv" : "movie";
      const res = await fetch(
        `https://api.themoviedb.org/3/${endpoint}/${item.id}` +
          `?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
      );
      const tmdb = await res.json();

      // 3.2) Detectar tipo extendido (Anime, Dorama, K-Drama, Serie o Película)
      const tipo = detectarTipo(
        {
          ...tmdb,
          genre_ids: tmdb.genre_ids || tmdb.genres?.map((g) => g.id) || [],
          original_language: tmdb.original_language,
          origin_country: tmdb.origin_country || [],
        },
        mediaType
      );

      // 3.3) Upsert en contenido (guardar media_type)
      const { error: err1 } = await supabase.from("contenido").upsert([
        {
          id: tmdb.id,
          tipo,
          media_type: mediaType, // Guardar media_type ("movie" o "tv")
          anio:
            (mediaType === "tv"
              ? tmdb.first_air_date
              : tmdb.release_date
            )?.slice(0, 4) || null,
          imagen: tmdb.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
            : null,
          finalizada: mediaType === "tv" ? tmdb.status === "Ended" : true,
        },
      ]);
      if (err1) {
        console.error("Error al insertar contenido:", err1);
        return;
      }

      // 3.4) Upsert en traducciones
      const idiomaCorto = idiomaPreferido.slice(0, 2);
      const { error: err2 } = await supabase
        .from("contenido_traducciones")
        .upsert(
          [
            {
              contenido_id: tmdb.id,
              idioma: idiomaCorto,
              nombre: tmdb.name || tmdb.title,
              sinopsis: tmdb.overview,
            },
          ],
          { onConflict: "contenido_id,idioma" }
        );
      if (err2) {
        console.error("Error al insertar traducción:", err2);
        return;
      }
    }

    // 3.5) Navegar a detalle usando media_type
    navigate(`/detalle/${item.media_type}/${item.id}`);
    
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="border rounded px-3 py-1 w-full"
        placeholder="Buscar series, películas o animes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {resultados.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded w-full max-h-80 overflow-y-auto shadow-lg">
          {resultados.map((item) => (
            <li
              key={`${item.media_type}-${item.id}`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => seleccionar(item)}
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                  alt={item.name || item.title}
                  className="w-12 h-18 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-300 rounded" />
              )}

              <div className="flex-1">
                <p className="text-sm font-medium text-black hover:underline">
                  {item.name || item.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {(item.first_air_date || item.release_date)?.slice(0, 4) ||
                      ""}
                  </span>
                  <span className="uppercase">
                    {item.media_type === "tv" ? "Serie" : "Película"}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
