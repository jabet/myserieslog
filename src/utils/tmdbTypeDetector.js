// src/utils/tmdbTypeDetector.js

/**
 * Detecta el tipo de contenido TMDb ampliado con:
 * - Anime
 * - Dorama
 * - K-Drama
 * - Serie
 * - Película
 *
 * @param {object} tmdbData        – JSON completo de TMDb (TV o Movie endpoint).
 * @param {"tv"|"movie"} mediaType – "tv" para series, "movie" para películas.
 * @returns {"Anime"|"Dorama"|"K-Drama"|"Serie"|"Película"}
 */
export function detectarTipo(tmdbData, mediaType) {
  if (mediaType === "movie") {
    return "Película";
  }

  // Para series (TV)
  if (tmdbData.genres || tmdbData.genre_ids) {
    // Obtener nombres de géneros
    let genresNames = [];
    
    if (tmdbData.genres) {
      genresNames = tmdbData.genres.map(g => 
        typeof g === 'object' ? g.name.toLowerCase() : g.toLowerCase()
      );
    }

    // Verificar si es anime
    if (genresNames.some(g => g.includes('animat') || g.includes('anime')) ||
        tmdbData.original_language === 'ja') {
      return "Anime";
    }

    // Verificar si es K-Drama
    if (genresNames.some(g => g.includes('drama')) && 
        tmdbData.origin_country?.includes('KR')) {
      return "K-Drama";
    }

    // Verificar si es Dorama (países asiáticos)
    if (tmdbData.origin_country?.some(country => 
        ['KR', 'JP', 'CN', 'TH', 'TW'].includes(country))) {
      return "Dorama";
    }
  }

  return "Serie";
}
