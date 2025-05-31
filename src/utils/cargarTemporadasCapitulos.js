import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Carga todas las temporadas y episodios de una serie desde TMDb y los inserta en Supabase.
 * Los episodios de la temporada 0 se marcan como especiales.
 * @param {number|string} contenidoId - ID de la serie (de TMDb)
 * @param {string} idioma - Código de idioma, por ejemplo "es-ES"
 * @returns {Promise<boolean>}
 */
export async function cargarTemporadasCapitulos(contenidoId, idioma = "es-ES") {
  try {
    console.log(`Cargando temporadas para serie ${contenidoId}...`);

    // 1. Obtener metadatos de la serie
    const metaRes = await fetch(
      `${TMDB_BASE}/tv/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    const meta = await metaRes.json();
    if (!meta.seasons) return false;

    // 2. Cargar cada temporada
    const episodiosAll = [];
    for (const season of meta.seasons) {
      const seasonRes = await fetch(
        `${TMDB_BASE}/tv/${contenidoId}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=${idioma}`
      );
      const seasonData = await seasonRes.json();
      if (!seasonData.episodes) continue;

      const esEspecial = season.season_number === 0;
      episodiosAll.push(
        ...seasonData.episodes.map((ep) => ({
          contenido_id: contenidoId,
          temporada: esEspecial ? 0 : season.season_number,
          episodio: ep.episode_number,
          nombre: ep.name,
          fecha_emision: ep.air_date,
          imagen: ep.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : null,
          especial: esEspecial,
          // NUEVO: Añadir duración del episodio
          duracion: ep.runtime || meta.episode_run_time?.[0] || 45, // runtime del episodio o duración promedio de la serie o 45 min por defecto
        }))
      );
    }

    // 3. Insertar/actualizar episodios en Supabase
    if (episodiosAll.length > 0) {
      const { error } = await supabase
        .from("episodios")
        .upsert(episodiosAll, {
          onConflict: "contenido_id,temporada,episodio",
        });
      if (error) {
        console.error("Error upsert episodios:", error);
        return false;
      }
      console.log(`${episodiosAll.length} episodios cargados/actualizados`);
    }

    return true;
  } catch (err) {
    console.error("Error en cargarTemporadasCapitulos:", err);
    return false;
  }
}