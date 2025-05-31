import { calcularProximoEpisodio } from "./calcularProximoEpisodio";
import { supabase } from "./supabaseClient";

/**
 * Calcula próximos episodios para todas las series del usuario
 * @param {string} userId - ID del usuario
 */
export async function inicializarProximosEpisodios(userId) {
  try {
    console.log("Inicializando próximos episodios para usuario:", userId);
    
    // Obtener todas las series del usuario con estado "viendo"
    const { data: series, error } = await supabase
      .from("catalogo_usuario")
      .select("contenido_id")
      .eq("user_id", userId)
      .eq("estado", "viendo");

    if (error) {
      console.error("Error obteniendo series del usuario:", error);
      return;
    }

    if (!series?.length) {
      console.log("No hay series en estado 'viendo' para el usuario");
      return;
    }

    // Calcular próximo episodio para cada serie
    const promesas = series.map(s => 
      calcularProximoEpisodio(userId, s.contenido_id)
    );

    const resultados = await Promise.allSettled(promesas);
    
    const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidos = resultados.filter(r => r.status === 'rejected').length;
    
    console.log(`Próximos episodios inicializados: ${exitosos} exitosos, ${fallidos} fallidos de ${series.length} series`);
    
    return { exitosos, fallidos, total: series.length };
  } catch (error) {
    console.error("Error inicializando próximos episodios:", error);
    throw error;
  }
}