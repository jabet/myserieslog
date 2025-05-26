// --- Función utilitaria para llamar a TMDb ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchTMDbContent(type, tmdbId) {
  const url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=es-ES`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener datos de TMDb');
  return response.json();
}

export function parseTMDbContent(data, type) {
  return {
    titulo: data.title || data.name,
    sinopsis: data.overview,
    imagen: data.poster_path,
    media_type: type,
    tmdb_id: data.id,
    // Agrega aquí otros campos que necesites
  };
}

// --- Hook para usar datos de TMDb en componentes React ---
import { useState, useEffect } from 'react';

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