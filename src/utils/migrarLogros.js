import { supabase } from "../utils/supabaseClient";
import { LOGROS_DEFINICIONES } from "../utils/logros";

async function migrarLogros() {
  for (const logro of LOGROS_DEFINICIONES) {
    await supabase.from("logros").upsert({
      id: logro.id,
      nombre: logro.nombre,
      descripcion: logro.descripcion,
      emoji: logro.emoji,
      categoria: logro.categoria,
      color: logro.color,
      objetivo: logro.objetivo || null,
      extra: null // Puedes guardar aquí condiciones especiales si lo deseas
    });
  }
  console.log("Migración completada");
}

export default migrarLogros;