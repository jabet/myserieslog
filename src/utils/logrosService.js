// filepath: src/utils/logrosService.js
import { supabase } from "./supabaseClient";
import {
  LOGROS_DEFINICIONES,
  calcularLogrosDesbloqueados,
  calcularLogrosProximos,
  obtenerEstadisticasLogros,
  calcularProgresoLogro,
} from "./logros";

/**
 * Obtiene los logros desbloqueados por el usuario desde Supabase.
 */
export async function obtenerLogrosUsuario(user_id) {
  const { data, error } = await supabase
    .from("logros_usuario")
    .select("logro_id,desbloqueado_en")
    .eq("user_id", user_id);
  if (error) throw error;
  return data || [];
}

/**
 * Recalcula los logros conseguidos y los guarda en Supabase si hay nuevos.
 */
export async function recalcularYGuardarLogros(usuario, stats) {
  if (!usuario?.id || !stats) return;

  // 1. Calcula los logros conseguidos según las estadísticas
  const logrosConseguidos = calcularLogrosDesbloqueados(stats);

  // 2. Consulta los logros ya guardados en Supabase
  const yaGuardados = await obtenerLogrosUsuario(usuario.id);
  const idsGuardados = new Set(yaGuardados.map(l => l.logro_id));

  // 3. Prepara los nuevos logros a insertar
  const nuevos = logrosConseguidos
    .filter(l => !idsGuardados.has(l.id))
    .map(l => ({
      user_id: usuario.id,
      logro_id: l.id,
      desbloqueado_en: new Date().toISOString(),
    }));

  if (nuevos.length === 0) return;

  // 4. Inserta los nuevos logros en Supabase
  const { error } = await supabase
    .from("logros_usuario")
    .insert(nuevos, { returning: "minimal" });
  if (error) throw error;
}

/**
 * Devuelve el progreso de todos los logros para un usuario.
 */
export function obtenerProgresoLogros(stats) {
  return LOGROS_DEFINICIONES.map(logro => ({
    ...logro,
    porcentaje: calcularProgresoLogro(logro, stats),
  }));
}

/**
 * Devuelve el resumen de logros (total, desbloqueados, porcentaje).
 */
export function obtenerResumenLogros(stats) {
  return obtenerEstadisticasLogros(stats);
}