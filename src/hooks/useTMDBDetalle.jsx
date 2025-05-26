import { useState, useEffect } from "react";
import { fetchTMDbContent, parseTMDbContent } from "../utils/tmdb";
import { detectarTipo } from "../utils/tmdbTypeDetector";

export default function useTMDBDetalle(id, idioma) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !idioma) return;
    setDetalle(null);
    setLoading(true);
    setError(null);

    const fetchDetalle = async () => {
      let mediaType = "tv";
      let tmdb;
      try {
        tmdb = await fetchTMDbContent("tv", id, idioma);
        if (tmdb.success === false) {
          mediaType = "movie";
          tmdb = await fetchTMDbContent("movie", id, idioma);
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
        setDetalle({
          ...parseTMDbContent(tmdb, mediaType),
          tipo: tipoDetect,
        });
      } catch (e) {
        setDetalle(null);
        setError(e);
      }
      setLoading(false);
    };

    fetchDetalle();
  }, [id, idioma]);

  return { detalle, loading, error };
}