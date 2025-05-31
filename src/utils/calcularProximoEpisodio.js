// src/utils/calcularProximoEpisodio.js
import { supabase } from "./supabaseClient";

/**
 * Calcula y guarda el próximo episodio por ver de una serie para un usuario
 * @param {string} userId - ID del usuario
 * @param {number} contenidoId - ID de la serie
 * @returns {Promise<Object|null>} - Próximo episodio o null si no hay
 */
export async function calcularProximoEpisodio(userId, contenidoId) {
  try {
    // 1. Obtener todos los episodios de la serie ordenados
    const { data: episodios, error: errorEpisodios } = await supabase
      .from("episodios")
      .select("id, temporada, episodio, nombre, fecha_emision")
      .eq("contenido_id", contenidoId)
      .neq("temporada", 0) // Excluir especiales
      .order("temporada", { ascending: true })
      .order("episodio", { ascending: true });

    if (errorEpisodios) {
      console.error("Error obteniendo episodios:", errorEpisodios);
      return null;
    }

    if (!episodios?.length) {
      console.log(`No hay episodios para la serie ${contenidoId}`);
      return null;
    }

    // 2. Obtener episodios vistos por el usuario
    const { data: vistos, error: errorVistos } = await supabase
      .from("episodios_vistos")
      .select("episodio_id")
      .eq("user_id", userId)
      .in("episodio_id", episodios.map(ep => ep.id));

    if (errorVistos) {
      console.error("Error obteniendo episodios vistos:", errorVistos);
      return null;
    }

    const idsVistos = vistos?.map(v => v.episodio_id) || [];

    // 3. Encontrar el primer episodio NO visto
    const proximoEpisodio = episodios.find(ep => !idsVistos.includes(ep.id));

    if (!proximoEpisodio) {
      console.log(`No hay próximo episodio para la serie ${contenidoId} - todos vistos`);
      
      // Eliminar registro si no hay próximo episodio
      await supabase
        .from("proximo_episodio_usuario")
        .delete()
        .eq("user_id", userId)
        .eq("contenido_id", contenidoId);
      
      return null;
    }

    // 4. Guardar/actualizar en la tabla proximo_episodio_usuario
    const { error: errorUpsert } = await supabase
      .from("proximo_episodio_usuario")
      .upsert({
        user_id: userId,
        contenido_id: contenidoId,
        episodio_id: proximoEpisodio.id,
        temporada: proximoEpisodio.temporada,
        episodio: proximoEpisodio.episodio,
        actualizado_en: new Date().toISOString()
      }, {
        onConflict: "user_id,contenido_id"
      });

    if (errorUpsert) {
      console.error("Error guardando próximo episodio:", errorUpsert);
      return proximoEpisodio; // Devolver aunque no se haya guardado
    }

    console.log(`Próximo episodio calculado para serie ${contenidoId}: T${proximoEpisodio.temporada}E${proximoEpisodio.episodio}`);
    return proximoEpisodio;
  } catch (error) {
    console.error("Error calculando próximo episodio:", error);
    return null;
  }
}

/**
 * Recalcula el próximo episodio cuando se marca/desmarca un episodio como visto
 * @param {string} userId - ID del usuario
 * @param {number} contenidoId - ID de la serie
 */
export async function actualizarProximoEpisodio(userId, contenidoId) {
  console.log(`Actualizando próximo episodio para serie ${contenidoId}`);
  return await calcularProximoEpisodio(userId, contenidoId);
}