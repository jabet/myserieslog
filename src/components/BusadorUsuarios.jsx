import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function BuscadorUsuarios() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [searching, setSearching] = useState(false);

  const buscar = async (q) => {
    setQuery(q);
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    setSearching(true);
    const { data: session } = await supabase.auth.getSession();
    const user = session?.user;
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nick, avatar")
      .ilike("nick", `%${q}%`)
      .neq("id", user.id)
      .limit(10);
    if (error) console.error("Error buscando usuarios:", error);
    setResultados(data || []);
    setSearching(false);
  };

  const invitar = async (userId) => {
    const { error } = await supabase.from("amistad_solicitudes").insert([{ 
      solicitante: (await supabase.auth.getSession()).data.user.id, 
      receptor: userId, 
      estado: "pendiente" 
    }]);
    if (error) console.error("Error enviando invitación:", error);
    else alert("Invitación enviada");
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar usuarios…"
        value={query}
        onChange={(e) => buscar(e.target.value)}
        className="border px-2 py-1 rounded w-full"
      />
      {searching && <p className="text-sm text-gray-500">Buscando...</p>}
      <ul className="mt-2 space-y-1">
        {resultados.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div className="flex items-center gap-2">
              {u.avatar && <img src={u.avatar} className="w-6 h-6 rounded-full" />}
              <span>{u.nick}</span>
            </div>
            <button
              onClick={() => invitar(u.id)}
              className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
            >
              Invitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
