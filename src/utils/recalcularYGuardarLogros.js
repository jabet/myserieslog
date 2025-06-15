import { supabase } from "../utils/supabaseClient";
import { calcularLogrosDesbloqueados } from "../utils/logros";

export default async function recalcularYGuardarLogros(usuario, stats) {
  console.log("🔄 recalcularYGuardarLogros arrancó", usuario?.id, stats);
  if (!usuario?.id || !stats) return;

  const logrosConseguidos = calcularLogrosDesbloqueados(stats);
  console.log("✅ logrosConseguidos:", logrosConseguidos);

  // 2. Consulta los logros ya guardados en la tabla
  const { data: yaGuardados } = await supabase
    .from("logros_usuario")
    .select("logro_id")
    .eq("user_id", usuario.id);

  console.log("📋 yaGuardados:", yaGuardados);

  const idsGuardados = (yaGuardados || []).map((l) => l.logro_id);

  const nuevos = logrosConseguidos
    .filter((l) => !idsGuardados.includes(l.id))
    .map((l) => ({
      user_id: usuario.id,
      logro_id: l.id,
      desbloqueado_en: new Date().toISOString(),
    }));
  console.log("➕ nuevos a insertar:", nuevos);
  if (nuevos.length === 0) return;

  const { data, error } = await supabase
    .from("logros_usuario")
    .upsert(nuevos, { onConflict: ["user_id", "logro_id"] });
  console.log("🔺 upsert result:", { data, error });
}