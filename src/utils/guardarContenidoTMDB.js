import { supabase } from "./supabaseClient";
import { fetchTMDbContent, parseTMDbContent } from "./tmdb";

/**
 * Obtiene todos los datos de TMDb y los guarda en Supabase (upsert).
 * @param {string|number} id - ID TMDb
 * @param {"tv"|"movie"} mediaType
 * @param {string} idioma - Ej: "es-ES"
 * @returns {Promise<object|null>} - El objeto guardado o null si error
 */
export async function guardarContenidoTMDb(id, mediaType, idioma = "es-ES") {
  const tmdbRaw = await fetchTMDbContent(mediaType, id, idioma);
  const tmdbParsed = parseTMDbContent(tmdbRaw, mediaType);

  if (!tmdbParsed) return null;

  const { error } = await supabase.from("contenido").upsert([tmdbParsed]);
  if (error) {
    console.error("Error guardando contenido en Supabase:", error);
    return null;
  }
  return tmdbParsed;
}

/**
 * Obtiene y guarda todos los episodios de todas las temporadas de una serie TMDb en Supabase.
 * @param {string|number} serieId - ID TMDb de la serie
 * @param {string} idioma - Ej: "es-ES"
 */
export async function guardarEpisodiosSerieTMDb(serieId, idioma = "es-ES") {
  // 1. Obtener datos generales de la serie para saber cuántas temporadas tiene
  const serieRaw = await fetchTMDbContent("tv", serieId, idioma);
  if (!serieRaw || !serieRaw.seasons) return;

  for (const temporada of serieRaw.seasons) {
    if (typeof temporada.season_number !== "number" || temporada.season_number === 0) continue; // Saltar especiales

    // 2. Obtener episodios de la temporada
    const url = `https://api.themoviedb.org/3/tv/${serieId}/season/${temporada.season_number}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=${idioma}`;
    const resp = await fetch(url);
    if (!resp.ok) continue;
    const data = await resp.json();

    // 3. Guardar episodios en Supabase
    if (Array.isArray(data.episodes)) {
      const episodios = data.episodes.map(ep => ({
        // id: serial (autoincrement, lo ignora el upsert si no se pasa)
        contenido_id: serieId,
        temporada: temporada.season_number,
        episodio: ep.episode_number,
        nombre: ep.name,
        fecha_emision: ep.air_date,
        imagen: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
        especial: ep.special || false,
        duracion: ep.runtime || 45, // valor por defecto si no hay runtime
      }));

      // Upsert en Supabase usando la clave única (contenido_id, temporada, episodio)
      const { error } = await supabase
        .from("episodios")
        .upsert(episodios, { onConflict: ["contenido_id", "temporada", "episodio"] });
      if (error) {
        console.error(`Error guardando episodios T${temporada.season_number}:`, error);
      }
    }
    // Pequeño delay para no saturar la API
    await new Promise(res => setTimeout(res, 300));
  }
}