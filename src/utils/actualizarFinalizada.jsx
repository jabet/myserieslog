import { supabase } from "../utils/supabaseClient";

/**
 * Consulta TMDb para determinar si una serie está finalizada y actualiza Supabase
 * @param {number} idContenido - ID de la serie en TMDb
 * @param {string} idioma - Código de idioma (ej: "es-ES")
 * @returns {boolean|null} true si está finalizada, false si no, null si no se pudo determinar
 */
export async function actualizarCampoFinalizada(idContenido, idioma = "es-ES") {
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${idContenido}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );

    const tmdbData = await res.json();

    if (tmdbData?.status) {
      const estaFinalizada = tmdbData.status === "Ended";

      const { error } = await supabase
        .from("contenido")
        .update({ finalizada: estaFinalizada })
        .eq("id", idContenido);

      if (error) throw error;

      return estaFinalizada;
    }
  } catch (err) {
    console.error("Error actualizando campo finalizada:", err);
  }

  return null;
}
