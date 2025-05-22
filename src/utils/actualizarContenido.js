import { supabase } from "./supabaseClient";
import { detectarTipo } from "./tmdbTypeDetector";

 const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
 const TMDB_BASE = "https://api.themoviedb.org/3";

 export async function actualizarContenido(idContenido, idioma = "es-ES") {
   try {
     // 0) Leemos el tipo original (no estrictamente necesario)
     const { data: contenidoDB } = await supabase
       .from("contenido")
       .select("tipo")
       .eq("id", idContenido)
       .single();


    // 1) Traemos de TMDb sin asumir serie o peli
     const urls = {
       tv:    `${TMDB_BASE}/tv/${idContenido}`,
       movie: `${TMDB_BASE}/movie/${idContenido}`,
     };

    // intentamos siempre primero TV, luego Movie si no existe
    let tmdbRes = await fetch(
      `${urls.tv}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );
    let tmdbData = await tmdbRes.json();
    let mediaType = "tv";

    if (tmdbData.success === false) {
      tmdbRes = await fetch(
        `${urls.movie}?api_key=${TMDB_API_KEY}&language=${idioma}`
      );
      tmdbData = await tmdbRes.json();
      mediaType = "movie";
    }

    const tipo = detectarTipo(tmdbData, mediaType);

     // 2) Preparamos campos

    const nombre = tmdbData.name || tmdbData.title;
     const sinopsis = tmdbData.overview;
     const anio = (
       tmdbData.first_air_date ||
       tmdbData.release_date ||
       ""
     ).slice(0, 4);
     const imagen = tmdbData.poster_path
       ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
       : null;

    const finalizada =
      mediaType === "tv" ? tmdbData.status === "Ended" : true;
     const ahora = new Date().toISOString();

     // 3) Actualizamos metadata en contenido
     const { error: err1 } = await supabase
       .from("contenido")
       .update({
        tipo,               // guardamos el nuevo tipo detectado
         nombre,
         anio,
         imagen,
         finalizada,
         ultima_actualizacion: ahora,
       })
       .eq("id", idContenido);
     if (err1) throw err1;

     // 4) Traducción
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
