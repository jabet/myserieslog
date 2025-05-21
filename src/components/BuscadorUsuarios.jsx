// src/components/BuscadorUsuarios.jsx
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function BuscadorUsuarios() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [pendientes, setPendientes] = useState(new Set());
  const [amigos, setAmigos] = useState(new Set());

  useEffect(() => {
    // Cargar usuario y sus relaciones
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);

      // Pendientes enviados
      const { data: sol } = await supabase
        .from("amistad_solicitudes")
        .select("receptor")
        .eq("solicitante", user.id)
        .eq("estado", "pendiente");
      setPendientes(new Set(sol.map((r) => r.receptor)));

      // Amistades
      const { data: rels } = await supabase
        .from("amistades")
        .select("usuario1,usuario2")
        .or(`usuario1.eq.${user.id},usuario2.eq.${user.id}`);
      const amigoIds = rels.map((r) =>
        r.usuario1 === user.id ? r.usuario2 : r.usuario1
      );
      setAmigos(new Set(amigoIds));
    });
  }, []);

  const buscar = async (q) => {
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    const { data } = await supabase
      .from("usuarios")
      .select("id, nick, avatar")
      .ilike("nick", `%${q}%`)
      .neq("id", usuario?.id || "") // excluirme a mí
      .limit(10);
    setResultados(data || []);
  };

  const invitar = async (userId) => {
    await supabase.from("amistad_solicitudes").insert([
      {
        solicitante: usuario.id,
        receptor: userId,
        estado: "pendiente",
      },
    ]);
    pendientes.add(userId);
    setPendientes(new Set(pendientes));
  };

  // Efecto para disparar la búsqueda tras debounce
  useEffect(() => {
    const t = setTimeout(() => buscar(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Busca usuarios…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-2 py-1 rounded w-full"
      />

      {resultados.length > 0 && (
        <ul className="mt-2 space-y-1 border rounded shadow-lg bg-white max-h-60 overflow-y-auto">
          {resultados.map((u) => {
            const isFriend = amigos.has(u.id);
            const isPending = pendientes.has(u.id);
            return (
              <li
                key={u.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.nick}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                  <span className="font-medium">{u.nick}</span>
                </div>

                {isFriend ? (
                  <button
                    disabled
                    className="text-sm bg-green-500 text-white px-2 py-1 rounded cursor-default"
                  >
                    Amigos
                  </button>
                ) : isPending ? (
                  <button
                    disabled
                    className="text-sm bg-yellow-500 text-white px-2 py-1 rounded cursor-default"
                  >
                    Pendiente
                  </button>
                ) : (
                  <button
                    onClick={() => invitar(u.id)}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Invitar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
