import { supabase } from "./supabaseClient";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

/**
 * Actualiza los géneros de un contenido específico desde TMDb
 * @param {number} contenidoId - ID del contenido
 * @param {string} mediaType - "tv" o "movie"
 * @param {string} idioma - Idioma para la consulta
 * @returns {Promise<boolean>}
 */
export async function actualizarGeneros(contenidoId, mediaType, idioma = "es-ES") {
  try {
    console.log(`Actualizando géneros para ${mediaType} ${contenidoId}...`);

    // 1. Obtener datos desde TMDb
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const response = await fetch(
      `${TMDB_BASE}/${endpoint}/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`⚠️ Contenido ${mediaType} ${contenidoId} no encontrado en TMDb (404) - posiblemente eliminado`);
        
        // Marcar el contenido como "no encontrado" para evitar intentos futuros
        await supabase
          .from("contenido")
          .update({ 
            generos: ["No disponible"], // Marcar como no disponible
            ultima_actualizacion: new Date().toISOString()
          })
          .eq("id", contenidoId)
          .eq("media_type", mediaType);
        
        return false;
      }
      
      console.error(`Error HTTP ${response.status} para ${mediaType} ${contenidoId}`);
      return false;
    }

    const data = await response.json();

    if (!data.genres || data.genres.length === 0) {
      console.warn(`Sin géneros disponibles para ${mediaType} ${contenidoId}`);
      
      // Actualizar con array vacío para indicar que se revisó
      await supabase
        .from("contenido")
        .update({ 
          generos: [],
          ultima_actualizacion: new Date().toISOString()
        })
        .eq("id", contenidoId)
        .eq("media_type", mediaType);
      
      return false;
    }

    // 2. Extraer géneros
    const generos = data.genres.map(g => g.name);

    // 3. Actualizar en Supabase
    const { error } = await supabase
      .from("contenido")
      .update({ 
        generos,
        ultima_actualizacion: new Date().toISOString()
      })
      .eq("id", contenidoId)
      .eq("media_type", mediaType);

    if (error) {
      console.error("Error actualizando géneros en Supabase:", error);
      return false;
    }

    console.log(`✅ Géneros actualizados para ${mediaType} ${contenidoId}:`, generos);
    return true;

  } catch (error) {
    console.error(`Error actualizando géneros de ${mediaType} ${contenidoId}:`, error);
    return false;
  }
}

/**
 * Migra géneros para todo el contenido existente
 * @returns {Promise<object>}
 */
export async function migrarTodosLosGeneros() {
  try {
    console.log("Iniciando migración de géneros...");

    // CORREGIR: Simplificar la consulta para evitar errores de sintaxis
    const { data: contenidoSinGeneros, error } = await supabase
      .from("contenido")
      .select("id, media_type, nombre, generos")
      .or("generos.is.null,generos.eq.{}");

    if (error) {
      console.error("Error en consulta:", error);
      throw error;
    }

    if (!contenidoSinGeneros?.length) {
      console.log("No hay contenido sin géneros para actualizar");
      return { exitosos: 0, fallidos: 0, total: 0, noEncontrados: 0 };
    }

    // Filtrar en JavaScript para excluir los ya marcados como "No disponible"
    const contenidoFiltrado = contenidoSinGeneros.filter(item => {
      const generos = item.generos;
      // Excluir si ya tiene géneros válidos o si está marcado como "No disponible"
      return !generos || 
             generos.length === 0 || 
             (Array.isArray(generos) && !generos.includes("No disponible"));
    });

    if (!contenidoFiltrado.length) {
      console.log("No hay contenido sin géneros para actualizar (después del filtrado)");
      return { exitosos: 0, fallidos: 0, total: 0, noEncontrados: 0 };
    }

    console.log(`Encontrados ${contenidoFiltrado.length} elementos sin géneros`);

    let exitosos = 0;
    let fallidos = 0;
    let noEncontrados = 0;

    for (const item of contenidoFiltrado) {
      try {
        console.log(`🔄 Procesando ${item.media_type} ${item.id} - "${item.nombre}"`);
        
        const exito = await actualizarGeneros(item.id, item.media_type);
        if (exito) {
          exitosos++;
          console.log(`✅ ${item.media_type} ${item.id} actualizado`);
        } else {
          // Verificar si fue un 404 (no encontrado)
          try {
            const response = await fetch(
              `${TMDB_BASE}/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}?api_key=${TMDB_API_KEY}`
            );
            
            if (response.status === 404) {
              noEncontrados++;
              console.warn(`❌ ${item.media_type} ${item.id} no existe en TMDb`);
            } else {
              fallidos++;
              console.warn(`❌ Error en ${item.media_type} ${item.id}`);
            }
          } catch (checkError) {
            fallidos++;
            console.error(`❌ Error verificando ${item.media_type} ${item.id}:`, checkError);
          }
        }

        // Pausa para no saturar la API de TMDb
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        fallidos++;
        console.error(`❌ Error en ${item.media_type} ${item.id}:`, error);
      }
    }

    console.log(`Migración de géneros completada:`);
    console.log(`- Exitosos: ${exitosos}`);
    console.log(`- Fallidos: ${fallidos}`);
    console.log(`- No encontrados en TMDb: ${noEncontrados}`);
    
    return { 
      exitosos, 
      fallidos, 
      noEncontrados,
      total: contenidoFiltrado.length 
    };

  } catch (error) {
    console.error("Error en migración de géneros:", error);
    throw error;
  }
}