import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("amistad_solicitudes")
        .select("id, solicitante(nick,avatar)")
        .eq("receptor", user.id)
        .eq("estado", "pendiente");
      if (error) console.error("Error cargando solicitudes:", error);
      setSolicitudes(data || []);
    };
    cargar();
  }, []);

  const responder = async (id, acepto) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("amistad_solicitudes")
      .update({ estado: acepto ? "aceptada" : "rechazada" })
      .eq("id", id);

    if (acepto) {
      const sol = solicitudes.find(s => s.id === id);
      await supabase.from("amistades").insert([{
        usuario1: user.id,
        usuario2: sol.solicitante.id
      }]);
    }
    setSolicitudes(s => s.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Solicitudes</h2>
      {solicitudes.map(s => (
        <div key={s.id} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-2">
            {s.solicitante.avatar && (
              <img src={s.solicitante.avatar} className="w-6 h-6 rounded-full" />
            )}
            <span>{s.solicitante.nick}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => responder(s.id, true)} className="text-sm bg-green-600 text-white px-2 py-1 rounded">
              Aceptar
            </button>
            <button onClick={() => responder(s.id, false)} className="text-sm bg-red-600 text-white px-2 py-1 rounded">
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
