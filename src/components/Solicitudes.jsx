import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("amistad_solicitudes")
        .select("id, solicitante (id, nick, avatar)")
        .eq("receptor", (await supabase.auth.getUser()).data.user.id)
        .eq("estado", "pendiente");
      setSolicitudes(data || []);
    };
    cargar();
  }, []);

  const responder = async (id, solicitanteId, acepto) => {
    // 1. Actualizo la solicitud
    await supabase
      .from("amistad_solicitudes")
      .update({ estado: acepto ? "aceptada" : "rechazada" })
      .eq("id", id);

    if (acepto) {
      // 2. Inserto en amistades
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("amistades").insert([
        {
          usuario1: user.id,
          usuario2: solicitanteId,
          comparte_catalogo: false,
        },
      ]);
    }

    // 3. Refresco la lista de solicitudes
    setSolicitudes((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Solicitudes</h2>
      {solicitudes.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            {s.solicitante.avatar && (
              <img src={s.solicitante.avatar} className="w-6 h-6 rounded-full" />
            )}
            <span>{s.solicitante.nick}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => responder(s.id, s.solicitante.id, true)}
              className="text-sm bg-green-600 text-white px-2 py-1 rounded"
            >
              Aceptar
            </button>
            <button
              onClick={() => responder(s.id, s.solicitante.id, false)}
              className="text-sm bg-red-600 text-white px-2 py-1 rounded"
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
