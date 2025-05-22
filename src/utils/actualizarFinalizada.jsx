// src/utils/actualizarContenido.js
import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Fuerza la recarga de metadatos y traducción de un contenido (Serie o Película).
 * @param {number} idContenido 
 * @param {string} idioma  // ejemplo: "es-ES"
 */
export async function actualizarContenido(idContenido, idioma = "es-ES") {
  try {
    // 0) Leer el tipo (Serie o Película) desde BD
    const { data: contenidoDB, error: errTipo } = await supabase
      .from("contenido")
      .select("tipo")
      .eq("id", idContenido)
      .single();
    if (errTipo) throw errTipo;

    const esSerie = contenidoDB.tipo === "Serie";

    // 1) Consultar el endpoint adecuado de TMDb
    const endpoint = esSerie ? "tv" : "movie";
    const res = await fetch(
      `${TMDB_BASE}/${endpoint}/${idContenido}` +
        `?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    const tmdbData = await res.json();
    if (tmdbData.success === false) {
      throw new Error(`TMDb error: ${tmdbData.status_message}`);
    }

    // 2) Prepara datos a actualizar
    const nombre = esSerie ? tmdbData.name : tmdbData.title;
    const sinopsis = tmdbData.overview;
    const anio = (
      esSerie ? tmdbData.first_air_date : tmdbData.release_date
    )?.slice(0, 4);
    const imagen = tmdbData.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
      : null;
    const finalizada =
      esSerie ? tmdbData.status === "Ended" : true;

    const ahora = new Date().toISOString();

    // 3) Actualizar tabla contenido
    const { error: err1 } = await supabase
      .from("contenido")
      .update({
        nombre,
        anio,
        imagen,
        finalizada,
        ultima_actualizacion: ahora,
      })
      .eq("id", idContenido);
    if (err1) throw err1;

    // 4) Upsert en traducciones
    const { error: err2 } = await supabase
      .from("contenido_traducciones")
      .upsert(
        [
          {
            contenido_id: idContenido,
            idioma,
            nombre,
            sinopsis,
          },
        ],
        { onConflict: "contenido_id,idioma" }
      );
    if (err2) throw err2;

    return true;
  } catch (err) {
    console.error("Error actualizando contenido:", err);
    return false;
  }
}
