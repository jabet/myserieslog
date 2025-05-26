import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Actualiza las traducciones de un contenido desde TMDb.
 * @param {number|string} contenidoId - ID de la serie/película (de TMDb)
 * @returns {Promise<boolean>}
 */
export async function actualizarTraducciones(contenidoId) {
  try {
    // 1. Obtener traducciones desde TMDb
    const res = await fetch(
      `${TMDB_BASE}/tv/${contenidoId}/translations?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();
    if (!data.translations) return false;

    // 2. Preparar datos para Supabase
    const traduccionesRaw = data.translations.map((t) => ({
      contenido_id: contenidoId,
      idioma: t.iso_639_1,
      nombre: t.data?.name || "",
      sinopsis: t.data?.overview || "",
    }));

    // Elimina duplicados por idioma (deja solo la primera aparición)
    const traducciones = Object.values(
      traduccionesRaw.reduce((acc, curr) => {
        if (!acc[curr.idioma]) acc[curr.idioma] = curr;
        return acc;
      }, {})
    );

    // 3. Upsert en Supabase
    if (traducciones.length > 0) {
      const { error } = await supabase
        .from("contenido_traducciones")
        .upsert(traducciones, {
          onConflict: "contenido_id,idioma",
        });
      if (error) {
        console.error("Error upsert traducciones:", error);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Error en actualizarTraducciones:", err);
    return false;
  }
}