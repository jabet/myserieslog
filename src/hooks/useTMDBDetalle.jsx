import { useState, useEffect } from "react";
import { fetchTMDbContent, parseTMDbContent } from "../utils/tmdb";
import { detectarTipo } from "../utils/tmdbTypeDetector";

export default function useTMDBDetalle(id, idioma, mediaType) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !idioma || !mediaType) return;
    setDetalle(null);
    setLoading(true);
    setError(null);

    const fetchDetalle = async () => {
      let tmdb;
      try {
        tmdb = await fetchTMDbContent(mediaType, id, idioma);
        if (tmdb.success === false) {
          setDetalle(null);
          setError("No encontrado en TMDb");
          setLoading(false);
          return;
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
  }, [id, idioma, mediaType]);

  return { detalle, loading, error };
}