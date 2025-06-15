import { LOGROS_DEFINICIONES } from "./logros";
import { supabase } from "./supabaseClient";
import { notificarLogroDesbloqueado } from "./notificaciones";

export async function comprobarYMarcarLogros(stats, user_id) {
  const { data: desbloqueados, error } = await supabase
    .from("logros_usuario")
    .select("logro_id")
    .eq("user_id", user_id);

  if (error) throw error;
  const desbloqueadosIds = desbloqueados.map((l) => l.logro_id);

  const nuevosLogros = LOGROS_DEFINICIONES.filter(
    (logro) => logro.condicion(stats) && !desbloqueadosIds.includes(logro.id)
  );

  for (const logro of nuevosLogros) {
    await supabase.from("logros_usuario").insert([
      { user_id, logro_id: logro.id, desbloqueado_en: new Date().toISOString() },
    ]);
    // Enviar notificación
    await notificarLogroDesbloqueado(user_id, logro);
  }

  return nuevosLogros;
}