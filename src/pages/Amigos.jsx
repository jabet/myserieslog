import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Switch } from "@radix-ui/react-switch";

export default function Amigos() {
  const [usuario, setUsuario] = useState(null);
  const [amistades, setAmistades] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);
      await cargarAmigos(user.id);
    });
  }, []);

  const cargarAmigos = async (uid) => {
    const { data, error } = await supabase
      .from("amistades")
      .select(`
        id,
        usuario1,
        usuario2,
        estado,
        comparte_catalogo,
        usuarios1:usuarios!amistades_usuario1_fkey(id, nick),
        usuarios2:usuarios!amistades_usuario2_fkey(id, nick)
      `)
      .or(
        `and(usuario1.eq.${uid},estado.eq.aceptada),` +
        `and(usuario2.eq.${uid},estado.eq.aceptada)`
      );

    if (error) {
      console.error("Error cargando amistades:", error);
      return;
    }

    const lista = data.map((a) => {
      const amigo =
        a.usuario1 === uid ? a.usuarios2[0] : a.usuarios1[0];
      return {
        amistadId: a.id,
        amigoId: amigo.id,
        nick: amigo.nick,
        comparte: a.comparte_catalogo,
      };
    });
    setAmistades(lista);
  };

  const toggleComparte = async (amistadId, actual) => {
    const { error } = await supabase
      .from("amistades")
      .update({ comparte_catalogo: !actual })
      .eq("id", amistadId);

    if (error) {
      console.error("Error actualizando comparte_catalogo:", error);
      return;
    }

    setAmistades((prev) =>
      prev.map((a) =>
        a.amistadId === amistadId ? { ...a, comparte: !actual } : a
      )
    );
  };

  return (
    <div className="pt-24 px-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tus amigos</h1>
      {amistades.length === 0 && <p>No tienes amigos aún.</p>}
      <ul className="space-y-3">
        {amistades.map((a) => (
          <li
            key={a.amistadId}
            className="flex items-center justify-between bg-white p-3 rounded shadow"
          >
            <span>{a.nick}</span>
            <div className="flex items-center gap-2">
              <label className="text-sm">Compartir catálogo</label>
              <Switch
                checked={a.comparte}
                onCheckedChange={() =>
                  toggleComparte(a.amistadId, a.comparte)
                }
                className="w-12 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-green-500"
              >
                <span className="block w-6 h-6 bg-white rounded-full shadow transition-transform data-[state=checked]:translate-x-6" />
              </Switch>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
