// AÑADIR: Validación de API Key al inicio del archivo
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// Validar que tenemos la API Key
if (!TMDB_API_KEY) {
  console.error(
    "⚠️ VITE_TMDB_API_KEY no está configurada en las variables de entorno"
  );
}

// --- Función utilitaria para llamar a TMDb ---
// CORREGIDO: Sin export aquí
const buscarContenido = async (query, tipo = "multi") => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/${tipo}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    );

    if (!response.ok) {
      throw new Error("Error en la búsqueda");
    }

    const data = await response.json();

    // Mejor: Solo los campos que realmente devuelve la búsqueda
    return data.results.map((item) => ({
      id: item.id,
      nombre: item.title || item.name,
      nombre_original: item.original_title || item.original_name,
      descripcion: item.overview,
      poster: item.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
        : null,
      backdrop: item.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}`
        : null,
      fecha_estreno: item.release_date || item.first_air_date,
      media_type: item.media_type || tipo,
      popularidad: item.popularity,
      puntuacion: item.vote_average,
      generos: item.genre_ids || [],
      // Los siguientes campos no existen en la búsqueda, puedes omitirlos o dejarlos en null explícitamente
      duracion: null,
      temporadas: null,
      episodios_totales: null,
      estado_serie: null,
      en_emision: null,
      tipo: determinarTipo(item, item.media_type || tipo),
    }));
  } catch (error) {
    console.error("Error buscando contenido:", error);
    throw error;
  }
};

// CORREGIDO: Sin export aquí
const obtenerDetallesContenido = async (id, tipo) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${tipo}/${id}?api_key=${TMDB_API_KEY}&language=es-ES&append_to_response=credits`
    );

    if (!response.ok) {
      throw new Error("Error obteniendo detalles");
    }

    const data = await response.json();

    return {
      id: data.id,
      nombre: data.title || data.name,
      // NUEVO: Añadir nombre original
      nombre_original: data.original_title || data.original_name,
      descripcion: data.overview,
      poster: data.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}`
        : null,
      backdrop: data.backdrop_path
        ? `${TMDB_IMAGE_BASE_URL}${data.backdrop_path}`
        : null,
      fecha_estreno: data.release_date || data.first_air_date,
      media_type: tipo,
      popularidad: data.popularity,
      puntuacion: data.vote_average,
      generos: data.genres?.map((g) => g.name) || [],
      duracion: data.runtime || null,
      temporadas: data.number_of_seasons || null,
      episodios_totales: data.number_of_episodes || null,
      estado_serie: data.status || null,
      en_emision: data.in_production || false,
      reparto:
        data.credits?.cast?.slice(0, 10)?.map((actor) => ({
          nombre: actor.name,
          personaje: actor.character,
          foto: actor.profile_path
            ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`
            : null,
        })) || [],
    };
  } catch (error) {
    console.error("Error obteniendo detalles:", error);
    throw error;
  }
};

// CORREGIDO: Sin export aquí
const fetchTMDbContent = async (mediaType, id, idioma = "es-ES") => {
  try {
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const response = await fetch(
      `${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${TMDB_API_KEY}&language=${idioma}&append_to_response=credits,external_ids`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Contenido no encontrado" };
      }
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.id) {
      return { success: false, error: "Datos inválidos de TMDB" };
    }

    return {
      ...data,
      success: true,
      media_type: mediaType,
      title: data.title || data.name,
      original_title: data.original_title || data.original_name,
      release_date: data.release_date || data.first_air_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      vote_average: data.vote_average,
      popularity: data.popularity,
      genres: data.genres || [],
      genre_ids: data.genres?.map((g) => g.id) || [],
      runtime: data.runtime,
      number_of_seasons: data.number_of_seasons,
      number_of_episodes: data.number_of_episodes,
      status: data.status,
      in_production: data.in_production,
      origin_country: data.origin_country || [],
      original_language: data.original_language,
      credits: data.credits,
      external_ids: data.external_ids,
    };
  } catch (error) {
    console.error("Error obteniendo contenido de TMDB:", error);
    return { success: false, error: error.message };
  }
};

// CORREGIR: Remover 'export' de la función parseTMDbContent
const parseTMDbContent = (tmdbData, mediaType) => {
  if (!tmdbData || tmdbData.success === false) {
    return null;
  }

  const fechaEstreno = tmdbData.release_date || tmdbData.first_air_date;

  return {
    id: tmdbData.id,
    nombre: tmdbData.title || tmdbData.name,
    nombre_original: tmdbData.original_title || tmdbData.original_name,
    anio: fechaEstreno ? new Date(fechaEstreno).getFullYear() : null,
    sinopsis: tmdbData.overview || "Sin sinopsis disponible",
    imagen: tmdbData.poster_path
      ? `${TMDB_IMAGE_BASE_URL}${tmdbData.poster_path}`
      : null,
    backdrop: tmdbData.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}${tmdbData.backdrop_path}`
      : null,
    generos: tmdbData.genres?.map((g) => g.name) || [],
    puntuacion: tmdbData.vote_average || 0,
    popularidad: tmdbData.popularity || 0,
    duracion: tmdbData.runtime || null,
    temporadas: tmdbData.number_of_seasons || null,
    episodios_totales: tmdbData.number_of_episodes || null,
    estado_serie: tmdbData.status || null,
    en_emision: tmdbData.in_production || false,
    finalizada: mediaType === "movie" ? true : tmdbData.status === "Ended",
    fecha_estreno: fechaEstreno,
    media_type: mediaType,
    // NUEVO: Usar la función determinarTipo
    tipo: determinarTipo(tmdbData, mediaType),
    reparto:
      tmdbData.credits?.cast?.slice(0, 10)?.map((actor) => ({
        nombre: actor.name,
        personaje: actor.character,
        foto: actor.profile_path
          ? `${TMDB_IMAGE_BASE_URL}${actor.profile_path}`
          : null,
      })) || [],
    external_ids: tmdbData.external_ids || {},
    // Campos adicionales para compatibilidad
    genre_ids: tmdbData.genre_ids || tmdbData.genres?.map((g) => g.id) || [],
    original_language: tmdbData.original_language,
    origin_country: tmdbData.origin_country || [],
  };
};

// CORREGIR: Remover 'export' de la función individual
function determinarTipo(data, mediaType) {
  if (mediaType === "movie") {
    return "Película";
  }

  // Para series (TV)
  if (data.genres) {
    const genresNames = data.genres.map((g) => g.name.toLowerCase());

    // Verificar si es anime
    if (genresNames.some((g) => g.includes("animat") || g.includes("anime"))) {
      return "Anime";
    }

    // Verificar si es K-Drama
    if (
      genresNames.some((g) => g.includes("drama")) &&
      data.origin_country?.includes("KR")
    ) {
      return "K-Drama";
    }

    // Verificar si es Dorama (países asiáticos)
    if (
      data.origin_country?.some((country) =>
        ["KR", "JP", "CN", "TH", "TW"].includes(country)
      )
    ) {
      return "Dorama";
    }
  }

  return "Serie";
}

// MANTENER solo las exportaciones al final
export {
  buscarContenido,
  obtenerDetallesContenido,
  fetchTMDbContent,
  parseTMDbContent,
  determinarTipo,
  TMDB_API_KEY,
};
