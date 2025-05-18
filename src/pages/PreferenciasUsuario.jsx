import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";

export default function PreferenciasUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState("");
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data: pref } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);

        const { data: perfil } = await supabase
          .from("usuarios")
          .select("nick, avatar")
          .eq("id", user.id)
          .maybeSingle();

        if (perfil?.nick) setNick(perfil.nick);
        if (perfil?.avatar) setAvatar(perfil.avatar);
      }
    });
  }, []);

  const guardarCambios = async () => {
    if (!usuario) return;

    await supabase.from("preferencias_usuario").upsert(
      {
        user_id: usuario.id,
        idioma_preferido: idioma,
      },
      { onConflict: "user_id" }
    );

    await supabase.from("usuarios").upsert(
      {
        id: usuario.id,
        nick,
        avatar,
      },
      { onConflict: "id" }
    );

    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Preferencias de usuario</h1>

        <label className="block text-sm font-medium mb-1" htmlFor="nick">
          Tu apodo (nick):
        </label>
        <input
          id="nick"
          type="text"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Escribe tu nombre visible..."
        />

        <label className="block text-sm font-medium mb-1" htmlFor="avatar">
          URL de tu avatar (imagen):
        </label>
        <input
          id="avatar"
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="https://..."
        />

        <label className="block text-sm font-medium mb-1" htmlFor="idioma">
          Idioma preferido:
        </label>
        <select
          id="idioma"
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
          <option value="de">Alemán</option>
        </select>

        <button
          onClick={guardarCambios}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar cambios
        </button>

        {guardado && (
          <p className="mt-3 text-green-600 text-sm">
            ¡Preferencias guardadas!
          </p>
        )}
      </main>
    </>
  );
}
