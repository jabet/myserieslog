import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Actualiza las duraciones de películas existentes desde TMDb
 * @param {number} contenidoId - ID de la película
 * @param {string} idioma - Idioma para la consulta
 * @returns {Promise<boolean>}
 */
export async function actualizarDuracionPelicula(contenidoId, idioma = "es-ES") {
  try {
    console.log(`Actualizando duración para película ${contenidoId}...`);

    // 1. Obtener datos de la película desde TMDb
    const response = await fetch(
      `${TMDB_BASE}/movie/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    
    if (!response.ok) {
      console.error(`Error HTTP ${response.status} para película ${contenidoId}`);
      return false;
    }

    const movieData = await response.json();
    
    if (!movieData.runtime) {
      console.warn(`No se encontró duración para película ${contenidoId}`);
      return false;
    }

    // 2. Actualizar duración en Supabase
    const { error } = await supabase
      .from("contenido")
      .update({ duracion: movieData.runtime })
      .eq("id", contenidoId)
      .eq("media_type", "movie");

    if (error) {
      console.error("Error actualizando duración en Supabase:", error);
      return false;
    }

    console.log(`✅ Duración actualizada para película ${contenidoId}: ${movieData.runtime} minutos`);
    return true;

  } catch (error) {
    console.error(`Error actualizando duración de película ${contenidoId}:`, error);
    return false;
  }
}