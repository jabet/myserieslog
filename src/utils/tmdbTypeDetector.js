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
 * @param {Array<string>} [generos] – Lista de géneros adicionales (opcional).
 * @returns {"Anime"|"Dorama"|"K-Drama"|"Serie"|"Película"}
 */
export function detectarTipo(tmdbData, mediaType, generos = []) {
  if (mediaType === "movie") {
    return "Película";
  }

  // Unificar todos los géneros posibles en minúsculas
  let genresNames = [];
  if (tmdbData.genres) {
    genresNames = tmdbData.genres.map(g =>
      typeof g === 'object' ? (g.name || '').toLowerCase() : (g || '').toLowerCase()
    );
  }
  if (Array.isArray(generos)) {
    genresNames = genresNames.concat(generos.map(g => g.toLowerCase()));
  }

  const originCountries = tmdbData.origin_country || [];
  const language = tmdbData.original_language || "";

  // Anime: género anime/animación o idioma japonés o país JP
  if (
    genresNames.some(g =>
      g.includes('anime') ||
      g.includes('animación') ||
      g.includes('animation') ||
      g.includes('アニメ')
    ) ||
    language === 'ja' ||
    originCountries.includes('JP')
  ) {
    return "Anime";
  }

  // K-Drama: género drama, país Corea del Sur, idioma coreano
  if (
    genresNames.some(g => g.includes('drama')) &&
    (originCountries.includes('KR') || language === 'ko')
  ) {
    return "K-Drama";
  }

  // Dorama: drama asiático (excepto Corea, pero incluye JP, CN, TH, TW)
  if (
    genresNames.some(g => g.includes('drama')) &&
    originCountries.some(country => ['JP', 'CN', 'TH', 'TW'].includes(country))
  ) {
    return "Dorama";
  }

  // Dorama: cualquier serie de JP, CN, TH, TW aunque no sea drama
  if (
    originCountries.some(country => ['JP', 'CN', 'TH', 'TW'].includes(country))
  ) {
    return "Dorama";
  }

  // Si algún género adicional indica anime, drama, etc.
  if (genresNames.some(g => g.includes('anime'))) {
    return "Anime";
  }
  if (genresNames.some(g => g.includes('drama'))) {
    return "Serie";
  }

  // Por defecto
  return "Serie";
}
