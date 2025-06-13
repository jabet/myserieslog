import { supabase } from "./supabaseClient";

// 1. Obtener todos los logros definidos
export async function obtenerLogrosDefinidos() {
  const { data, error } = await supabase.from("logros").select("*");
  if (error) throw error;
  return data;
}

// 2. Obtener logros desbloqueados del usuario
export async function obtenerLogrosUsuario(user_id) {
  const { data, error } = await supabase
    .from("logros_usuario")
    .select("logro_id")
    .eq("user_id", user_id);
  if (error) throw error;
  return data.map((l) => l.logro_id);
}

// 3. Calcular logros desbloqueados y próximos
export async function calcularLogrosUsuario(user_id, stats) {
  // stats: estadísticas del usuario (series, películas, etc.)
  const logros = await obtenerLogrosDefinidos();
  const desbloqueadosIds = await obtenerLogrosUsuario(user_id);

  // Si tienes condiciones especiales, deberías mapearlas aquí
  // Por ejemplo, puedes guardar la función de condición como string en el campo extra y evaluarla con new Function,
  // o mantener la lógica en el frontend como antes, pero usando los datos de Supabase.

  // Ejemplo simple: solo marcar como desbloqueados los que están en logros_usuario
  const desbloqueados = logros.filter((l) => desbloqueadosIds.includes(l.id));
  const proximos = logros.filter((l) => !desbloqueadosIds.includes(l.id));

  return {
    desbloqueados,
    proximos,
    resumen: {
      total: logros.length,
      desbloqueados: desbloqueados.length,
      porcentaje: Math.round((desbloqueados.length / logros.length) * 100),
    },
  };
}