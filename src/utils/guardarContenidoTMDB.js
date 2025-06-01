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