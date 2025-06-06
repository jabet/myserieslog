import { supabase } from "../utils/supabaseClient";

/**
 * Envía una notificación de logro desbloqueado al usuario
 * @param {string} userId
 * @param {object} logro
 */
export async function notificarLogroDesbloqueado(userId, logro) {
  await supabase.from("notificaciones_usuario").insert([
    {
      user_id: userId,
      titulo: "¡Nuevo logro desbloqueado!",
      mensaje: `${logro.emoji} ${logro.nombre}: ${logro.descripcion}`,
      url: "/perfil#logros",
      imagen: null, // Puedes poner una imagen si tienes
    },
  ]);
}