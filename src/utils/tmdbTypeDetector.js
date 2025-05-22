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
  // Géneros TMDb de interés
  const ID_ANIMATION = 16;
  const ID_DRAMA     = 18;

  // Extraemos arrays de géneros, idioma y países de origen
  const genreIds        = tmdbData.genre_ids || tmdbData.genres?.map((g) => g.id) || [];
  const lang            = tmdbData.original_language;
  const originCountries = tmdbData.origin_country || [];

  const isAnimation = genreIds.includes(ID_ANIMATION);
  const isDrama     = genreIds.includes(ID_DRAMA);
  const isJapanese  = lang === "ja" && originCountries.includes("JP");
  const isKorean    = lang === "ko" && originCountries.includes("KR");

  // 1) Anime: animación japonesa
  if (isAnimation && isJapanese) {
    return "Anime";
  }

  // 2) Dorama: drama live-action japonés (no animación)
  if (!isAnimation && isDrama && isJapanese) {
    return "Dorama";
  }

  // 3) K-Drama: drama live-action coreano (no animación)
  if (!isAnimation && isDrama && isKorean) {
    return "K-Drama";
  }

  // 4) Serie: resto de “tv” o contenido con first_air_date
  if (mediaType === "tv" || !!tmdbData.first_air_date) {
    return "Serie";
  }

  // 5) Película: resto de casos
  return "Película";
}
