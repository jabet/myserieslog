// src/utils/actualizarContenido.js
import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function actualizarContenido(idContenido, idioma = "es-ES") {
  try {
    // 1) Traer datos de TMDb
    const res = await fetch(
      `${TMDB_BASE}/tv/${idContenido}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    const tmdbData = await res.json();
    if (!tmdbData.id) throw new Error("TMDb no encontró el contenido");

    const ahora = new Date().toISOString();

    // 2) Actualizar tabla contenido
    const { error: err1 } = await supabase
      .from("contenido")
      .update({
        nombre: tmdbData.name || tmdbData.title,
        tipo: tmdbData.first_air_date ? "Serie" : "Película",
        anio: (tmdbData.first_air_date || tmdbData.release_date || "")
          .slice(0, 4),
        imagen: tmdbData.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
          : null,
        finalizada: tmdbData.status === "Ended",
        ultima_actualizacion: ahora,
      })
      .eq("id", idContenido);
    if (err1) throw err1;

    // 3) Actualizar o insertar traducción en español
    const { error: err2 } = await supabase
      .from("contenido_traducciones")
      .upsert(
        [
          {
            contenido_id: idContenido,
            idioma,
            nombre: tmdbData.name || tmdbData.title,
            sinopsis: tmdbData.overview,
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
