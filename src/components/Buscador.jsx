import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function Buscador() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es-ES");
  const [esAdmin, setEsAdmin] = useState(false);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const navigate = useNavigate();

  // Cargar idioma preferido del usuario si está logueado
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
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

  // Obtener rol del usuario desde la tabla usuarios
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id)
          .single();
        setEsAdmin(usuario?.role === "admin");
      } else {
        setEsAdmin(false);
      }
    });
  }, []);

  // Búsqueda híbrida con debounce
  useEffect(() => {
    if (query.length < 2) {
      setResultados([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // 1. PRIMERO: Buscar en Supabase
        const idiomaCorto = idiomaPreferido.slice(0, 2);
        const { data: supabaseResults } = await supabase
          .from("contenido")
          .select(
            `
            id, 
            media_type, 
            tipo, 
            anio, 
            imagen,
            contenido_traducciones!inner(nombre)
          `
          )
          .ilike("contenido_traducciones.nombre", `%${query}%`)
          .eq("contenido_traducciones.idioma", idiomaCorto)
          .limit(10);

        // 2. SEGUNDO: Buscar en TMDb para completar resultados
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?` +
            `api_key=${TMDB_API_KEY}` +
            `&language=${idiomaPreferido}` +
            `&query=${encodeURIComponent(query)}`
        );
        const tmdbData = await res.json();

        // Filtrar solo series y películas de TMDb
        const tmdbResults = (tmdbData.results || [])
          .filter(
            (item) => item.media_type === "tv" || item.media_type === "movie"
          )
          .slice(0, 10);

        // 3. Combinar resultados, priorizando Supabase
        const supabaseIds = new Set(
          (supabaseResults || []).map((item) => item.id)
        );
        const tmdbFiltered = tmdbResults.filter(
          (item) => !supabaseIds.has(item.id)
        );

        const resultadosCombinados = [
          ...(supabaseResults || []).map((item) => {
            // Forzar media_type a "tv" o "movie" siempre
            let media_type = item.media_type;
            if (media_type !== "tv" && media_type !== "movie") {
              if (item.tipo === "Serie") media_type = "tv";
              else if (item.tipo === "Película") media_type = "movie";
              else media_type = "movie"; // fallback seguro
            }
            return {
              ...item,
              nombre: item.contenido_traducciones[0]?.nombre || `ID: ${item.id}`,
              fromSupabase: true,
              media_type,
            };
          }),
          ...tmdbFiltered.map((item) => ({
            id: item.id,
            media_type: item.media_type,
            nombre: item.name || item.title,
            anio: (item.first_air_date || item.release_date)?.slice(0, 4),
            imagen: item.poster_path
              ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
              : null,
            tipo: item.media_type === "tv" ? "Serie" : "Película",
            fromSupabase: false,
          })),
        ];

        setResultados(resultadosCombinados);
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setResultados([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, idiomaPreferido]);

  // Navegar directamente al detalle - NO guardar nada
  const seleccionar = (item) => {
    //console.log("Navegando a detalle con:", item); // <-- Añade este log
    if (!item?.id || !item.media_type) return;
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
          {resultados.map((item, index) => (
            <li
              key={`${item.media_type}-${item.id}-${index}`}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => seleccionar(item)}
            >
              {item.imagen ? (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-12 h-18 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">
                  Sin imagen
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-black">
                    {item.nombre}
                  </p>
                  {esAdmin && item.fromSupabase && (
                    <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                      Guardado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.anio || ""}</span>
                  <span className="uppercase">{item.tipo}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
