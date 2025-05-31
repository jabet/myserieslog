import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Actualiza las duraciones de episodios existentes desde TMDb
 * @param {number} contenidoId - ID de la serie
 * @param {string} idioma - Idioma para la consulta
 * @returns {Promise<boolean>}
 */
export async function actualizarDuracionEpisodios(contenidoId, idioma = "es-ES") {
  try {
    console.log(`Actualizando duraciones para serie ${contenidoId}...`);

    // 1. Obtener metadatos de la serie
    const metaRes = await fetch(
      `${TMDB_BASE}/tv/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    const meta = await metaRes.json();
    if (!meta.seasons) return false;

    const duracionPromedio = meta.episode_run_time?.[0] || 45;

    // 2. Obtener episodios existentes en Supabase
    const { data: episodiosExistentes } = await supabase
      .from("episodios")
      .select("id, temporada, episodio")
      .eq("contenido_id", contenidoId);

    if (!episodiosExistentes?.length) return false;

    // 3. Cargar duraciones desde TMDb para cada temporada
    const actualizaciones = [];
    const temporadasUnicas = [...new Set(episodiosExistentes.map(ep => ep.temporada))];

    for (const numTemporada of temporadasUnicas) {
      try {
        const seasonRes = await fetch(
          `${TMDB_BASE}/tv/${contenidoId}/season/${numTemporada}?api_key=${TMDB_API_KEY}&language=${idioma}`
        );
        const seasonData = await seasonRes.json();
        
        if (seasonData.episodes) {
          for (const episodioTMDb of seasonData.episodes) {
            const episodioLocal = episodiosExistentes.find(
              ep => ep.temporada === numTemporada && ep.episodio === episodioTMDb.episode_number
            );
            
            if (episodioLocal) {
              actualizaciones.push({
                id: episodioLocal.id,
                duracion: episodioTMDb.runtime || duracionPromedio
              });
            }
          }
        }
      } catch (seasonError) {
        console.warn(`Error cargando temporada ${numTemporada}:`, seasonError);
      }
    }

    // 4. Actualizar en lotes
    if (actualizaciones.length > 0) {
      for (const update of actualizaciones) {
        await supabase
          .from("episodios")
          .update({ duracion: update.duracion })
          .eq("id", update.id);
      }
      
      console.log(`${actualizaciones.length} duraciones actualizadas`);
    }

    return true;
  } catch (err) {
    console.error("Error actualizando duraciones:", err);
    return false;
  }
}