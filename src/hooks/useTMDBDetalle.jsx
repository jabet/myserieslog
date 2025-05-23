import { useEffect, useState } from "react";
import { detectarTipo } from "../utils/tmdbTypeDetector";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export default function useTMDBDetalle(id, idioma) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !idioma) return;
    setLoading(true);

    const fetchDetalle = async () => {
      let mediaType = "tv";
      let res = await fetch(
        `${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=${idioma}`
      );
      let tmdb = await res.json();
      if (tmdb.success === false) {
        mediaType = "movie";
        res = await fetch(
          `${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=${idioma}`
        );
        tmdb = await res.json();
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
        id: tmdb.id,
        nombre: tmdb.name || tmdb.title,
        tipo: tipoDetect,
        sinopsis: tmdb.overview || "Sin sinopsis.",
        anio:
          (mediaType === "tv" ? tmdb.first_air_date : tmdb.release_date)?.slice(
            0,
            4
          ) || "Desconocido",
        imagen: tmdb.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
          : null,
        finalizada: mediaType === "tv" ? tmdb.status === "Ended" : true,
      });
      setLoading(false);
    };

    fetchDetalle();
  }, [id, idioma]);

  return { detalle, loading };
}