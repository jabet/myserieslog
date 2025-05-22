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

  // Carga usuario y su idioma
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

  // Búsqueda con debounce
  useEffect(() => {
    if (query.length < 2) return setResultados([]);

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

  // Función que maneja la selección de un resultado
  const seleccionar = async (item) => {
    if (!item?.id) return;

    // 1. Verificar si ya existe en Supabase
    const { data: existente } = await supabase
      .from("contenido")
      .select("id")
      .eq("id", item.id)
      .maybeSingle();

    if (!existente) {
      // 2. Traer datos completos de TMDb según tipo
      const esSerie = item.media_type === "tv";
      const endpoint = esSerie
        ? `https://api.themoviedb.org/3/tv/${item.id}`
        : `https://api.themoviedb.org/3/movie/${item.id}`;

      const res = await fetch(
        `${endpoint}?api_key=${TMDB_API_KEY}` + `&language=${idiomaPreferido}`
      );
      const tmdb = await res.json();

      // 3. Upsert en contenido
      const { error: err1 } = await supabase.from("contenido").upsert([
        {
          id: tmdb.id,
          tipo: esSerie ? "Serie" : "Película",
          anio:
            (esSerie
              ? tmdb.first_air_date?.slice(0, 4)
              : tmdb.release_date?.slice(0, 4)) || null,
          imagen: tmdb.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
            : null,
        },
      ]);
      if (err1) {
        console.error("Error insertando en contenido:", err1);
        return;
      }

      // 4. Upsert en traducciones
      await supabase.from("contenido_traducciones").upsert(
        [
          {
            contenido_id: tmdb.id,
            idioma: idiomaPreferido,
            nombre: tmdb.name || tmdb.title,
            sinopsis: tmdb.overview,
          },
        ],
        { onConflict: "contenido_id,idioma" }
      );
    }

    // 5. Navegar a detalle
    navigate(`/detalle/${item.id}`);
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
        <ul className="absolute z-10 bg-white border rounded w-full max-h-72 overflow-y-auto shadow-lg">
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
              <div>
                <p className="text-sm font-medium text-black">
                  {item.name || item.title}
                </p>
                {item.media_type && (
                  <p className="text-xs text-gray-500 uppercase">
                    {item.media_type === "tv" ? "Serie" : "Película"}
                  </p>
                )}
                {(item.first_air_date || item.release_date) && (
                  <p className="text-xs text-gray-500">
                    {(item.first_air_date || item.release_date).slice(0, 4)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
