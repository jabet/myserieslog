import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { TMDB_API_KEY } from "../utils/tmdb";
import useUsuario from "./useUsuario";

// Normaliza un resultado para que siempre tenga los mismos campos clave
function normalizarResultado(item) {
  return {
    id: item.id,
    media_type: item.media_type,
    nombre: item.nombre,
    anio: item.anio,
    imagen: item.imagen,
    tipo: item.tipo,
    fromSupabase: !!item.fromSupabase,
  };
}

export default function useBusquedaContenido(query) {
  const { idioma } = useUsuario();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResultados([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const buscar = async () => {
      try {
        // 1. Buscar en Supabase
        const idiomaCorto = idioma?.slice(0, 2) || "es";
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

        // 2. Buscar en TMDb
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?` +
            `api_key=${TMDB_API_KEY}` +
            `&language=${idioma}` +
            `&query=${encodeURIComponent(query)}`
        );
        const tmdbData = await res.json();

        // Filtrar solo series y películas de TMDb
        const tmdbFiltered = (tmdbData.results || [])
          .filter((item) => item.media_type === "tv" || item.media_type === "movie")
          .map((item) => ({
            id: item.id,
            media_type: item.media_type,
            nombre: item.name || item.title,
            anio: (item.first_air_date || item.release_date)?.slice(0, 4),
            imagen: item.poster_path
              ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
              : null,
            tipo: item.media_type === "tv" ? "Serie" : "Película",
            fromSupabase: false,
          }));

        // IDs de Supabase para evitar duplicados
        const supabaseIds = new Set((supabaseResults || []).map((item) => item.id));

        // Normalizar y combinar resultados
        const resultadosCombinados = [
          ...(supabaseResults || []).map((item) => {
            let media_type = item.media_type;
            if (media_type !== "tv" && media_type !== "movie") {
              if (item.tipo === "Serie") media_type = "tv";
              else if (item.tipo === "Película") media_type = "movie";
              else media_type = "movie";
            }
            return normalizarResultado({
              ...item,
              nombre: item.contenido_traducciones[0]?.nombre || `ID: ${item.id}`,
              fromSupabase: true,
              media_type,
            });
          }),
          ...tmdbFiltered.filter((item) => !supabaseIds.has(item.id)).map(normalizarResultado),
        ];

        setResultados(resultadosCombinados);
      } catch (e) {
        setError("Error en la búsqueda");
        setResultados([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(buscar, 400);
    return () => clearTimeout(timer);
  }, [query, idioma]);

  return { resultados, loading, error };
}