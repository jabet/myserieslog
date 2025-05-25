import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Actualiza los datos principales de una serie o película en Supabase usando TMDb.
 * @param {number|string} id - ID de TMDb
 * @param {"movie"|"tv"} media_type - Tipo TMDb ("movie" o "tv")
 * @param {string} idioma - Idioma (opcional, por defecto "es-ES")
 * @returns {Promise<boolean>}
 */
export async function actualizarContenido(id, media_type, idioma = "es-ES") {
  try {
    let url;
    if (media_type === "tv") {
      url = `${TMDB_BASE}/tv/${id}?api_key=${TMDB_API_KEY}&language=${idioma}`;
    } else if (media_type === "movie") {
      url = `${TMDB_BASE}/movie/${id}?api_key=${TMDB_API_KEY}&language=${idioma}`;
    } else {
      throw new Error("media_type no soportado");
    }

    const res = await fetch(url);
    const data = await res.json();
    if (data.success === false) return false;

    // Prepara los campos que quieres actualizar en tu tabla "contenido"
    const update = {
      nombre: data.name || data.title || "",
      imagen: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      anio: (data.first_air_date || data.release_date || "").slice(0, 4),
      finalizada: media_type === "tv" ? data.status === "Ended" : true,
      ultima_actualizacion: new Date().toISOString(),
      media_type, // <-- Guarda el media_type ("movie" o "tv")
      // ...otros campos que quieras actualizar
    };

    const { error } = await supabase
      .from("contenido")
      .update(update)
      .eq("id", id)
      .eq("media_type", media_type); // <-- Asegura que actualizas el correcto

    if (error) {
      console.error("Error actualizando contenido:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error en actualizarContenido:", err);
    return false;
  }
}