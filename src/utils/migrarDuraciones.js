import { supabase } from "./supabaseClient";
import { actualizarDuracionEpisodios } from "./actualizarDuracionEpisodios";
import { actualizarDuracionPelicula } from "./actualizarDuracionPeliculas";

/**
 * Script para actualizar duraciones de todas las series y películas existentes
 */
export async function migrarTodasLasDuraciones() {
  try {
    console.log("Iniciando migración de duraciones...");

    // 1. Obtener todas las series únicas
    const { data: series } = await supabase
      .from("episodios")
      .select("contenido_id")
      .not("contenido_id", "is", null);

    const seriesUnicas = series?.length ? [...new Set(series.map(s => s.contenido_id))] : [];

    // 2. Obtener todas las películas únicas
    const { data: peliculas } = await supabase
      .from("contenido")
      .select("id")
      .eq("media_type", "movie");

    const peliculasUnicas = peliculas?.map(p => p.id) || [];

    console.log(`Encontradas ${seriesUnicas.length} series y ${peliculasUnicas.length} películas para actualizar`);

    let exitosos = 0;
    let fallidos = 0;
    const total = seriesUnicas.length + peliculasUnicas.length;

    // 3. Procesar series
    for (const serieId of seriesUnicas) {
      try {
        const exito = await actualizarDuracionEpisodios(serieId);
        if (exito) {
          exitosos++;
          console.log(`✅ Serie ${serieId} actualizada`);
        } else {
          fallidos++;
          console.warn(`❌ Error en serie ${serieId}`);
        }
        
        // Pausa para no saturar la API de TMDb
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        fallidos++;
        console.error(`❌ Error en serie ${serieId}:`, error);
      }
    }

    // 4. Procesar películas
    for (const peliculaId of peliculasUnicas) {
      try {
        const exito = await actualizarDuracionPelicula(peliculaId);
        if (exito) {
          exitosos++;
          console.log(`✅ Película ${peliculaId} actualizada`);
        } else {
          fallidos++;
          console.warn(`❌ Error en película ${peliculaId}`);
        }
        
        // Pausa para no saturar la API de TMDb
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        fallidos++;
        console.error(`❌ Error en película ${peliculaId}:`, error);
      }
    }

    console.log(`Migración completada: ${exitosos} exitosos, ${fallidos} fallidos de ${total} elementos`);
    return { exitosos, fallidos, total, series: seriesUnicas.length, peliculas: peliculasUnicas.length };

  } catch (error) {
    console.error("Error en migración:", error);
    throw error;
  }
}