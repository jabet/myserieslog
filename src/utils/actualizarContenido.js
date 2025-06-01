import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function actualizarContenido(id, mediaType, idioma = "es-ES") {
  try {
    console.log(`Actualizando contenido ${id} (${mediaType})`);

    // 1. Obtener datos de TMDb
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const response = await fetch(
      `${TMDB_BASE}/${endpoint}/${id}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );

    if (!response.ok) {
      console.error(`Error HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();

    // 2. Determinar fecha de estreno
    const fechaEstreno = data.first_air_date || data.release_date;

    // 3. Determinar el tipo según el género
    let tipo = data.media_type === "tv" ? "Serie" : "Película";

    if (mediaType === "tv" && data.genres) {
      const genresNames = data.genres.map((g) => g.name.toLowerCase());

      if (genresNames.some((g) => g.includes("animat") || g.includes("anime"))) {
        tipo = "Anime";
      } else if (
        genresNames.some((g) => g.includes("drama")) &&
        data.origin_country?.includes("KR")
      ) {
        tipo = "K-Drama";
      } else if (
        data.origin_country?.some((country) =>
          ["KR", "JP", "CN", "TH"].includes(country)
        )
      ) {
        tipo = "Dorama";
      }
    }

    // 4. Preparar datos para actualizar
    const datosActualizacion = {
      nombre: data.name || data.title,
      nombre_original: data.original_name || data.original_title,
      anio: fechaEstreno ? new Date(fechaEstreno).getFullYear() : null,
      imagen: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      generos: data.genres?.map((g) => g.name) || [],
      tipo,
      finalizada: data.media_type === "tv" ? data.status === "Ended" : true,
      ...(data.media_type === "movie" && data.runtime && {
        duracion: data.runtime,
      }),
      ultima_actualizacion: new Date().toISOString(),
    };

    // 5. Verificar si existe el contenido
    const { data: existeContenido } = await supabase
      .from("contenido")
      .select("id")
      .eq("id", id)
      .eq("media_type", mediaType)
      .single();

    if (existeContenido) {
      // Actualizar contenido existente
      const { error } = await supabase
        .from("contenido")
        .update(datosActualizacion)
        .eq("id", id)
        .eq("media_type", mediaType);

      if (error) {
        console.error("Error actualizando contenido:", error);
        return false;
      }
    } else {
      // Insertar nuevo contenido
      const { error } = await supabase
        .from("contenido")
        .insert({
          id,
          media_type: mediaType,
          ...datosActualizacion,
        });

      if (error) {
        console.error("Error insertando contenido:", error);
        return false;
      }
    }

    console.log(`Contenido ${id} actualizado correctamente`);
    return true;
  } catch (error) {
    console.error("Error actualizando contenido:", error);
    return false;
  }
}