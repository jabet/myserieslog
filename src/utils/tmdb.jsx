// --- Función utilitaria para llamar a TMDb ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function fetchTMDbContent(type, tmdbId) {
  let url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`;

  // Para series, incluir temporadas
  if (type === "tv") {
    url += "&append_to_response=seasons";
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener datos de TMDb");
  return response.json();
}

export function parseTMDbContent(data, type) {
  const baseData = {
    id: data.id,
    nombre: data.title || data.name,
    sinopsis: data.overview || "Sin sinopsis disponible.",
    imagen: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null,
    anio:
      data.release_date?.split("-")[0] || data.first_air_date?.split("-")[0],
    media_type: type,
    tmdb_id: data.id,
    desdeTMDB: true, // <-- IMPORTANTE: marca como de TMDb
  };

  if (type === "tv") {
    return {
      ...baseData,
      tipo: "Serie",
      finalizada: data.status === "Ended",
      temporadas: data.seasons || [], // <-- IMPORTANTE: incluir temporadas
    };
  } else {
    return {
      ...baseData,
      tipo: "Película",
    };
  }
}

// --- Hook para usar datos de TMDb en componentes React ---
import { useState, useEffect } from "react";

export function useTMDbContent(type, tmdbId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !tmdbId) return;
    setLoading(true);
    setError(null);

    fetchTMDbContent(type, tmdbId)
      .then((result) => setData(parseTMDbContent(result, type)))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [type, tmdbId]);

  return { data, loading, error };
}
