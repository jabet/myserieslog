// src/pages/PreferenciasUsuario.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";

export default function PreferenciasUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [nick, setNick] = useState("");
  const [avatar, setAvatar] = useState("");
  const [compartir, setCompartir] = useState(false);    // ← nuevo estado
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);

      // 1) Preferencias de idioma
      const { data: pref } = await supabase
        .from("preferencias_usuario")
        .select("idioma_preferido")
        .eq("user_id", user.id)
        .single();
      if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);

      // 2) Perfil: nick + avatar
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nick, avatar, compartir_catalogo")
        .eq("id", user.id)
        .maybeSingle();
      if (perfil?.nick) setNick(perfil.nick);
      if (perfil?.avatar) setAvatar(perfil.avatar);
      if (typeof perfil?.compartir_catalogo === "boolean") {
        setCompartir(perfil.compartir_catalogo);
      }
    });
  }, []);

  const guardarCambios = async () => {
    if (!usuario) return;

    // 1) Guardar idioma
    await supabase.from("preferencias_usuario").upsert(
      {
        user_id: usuario.id,
        idioma_preferido: idioma,
      },
      { onConflict: "user_id" }
    );

    // 2) Guardar perfil + compartir catálogo
    await supabase.from("usuarios").upsert(
      {
        id: usuario.id,
        nick,
        avatar,
        compartir_catalogo: compartir,       // ← lo incluimos aquí
      },
      { onConflict: "id" }
    );

    // Feedback
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Preferencias de usuario</h1>

        {/* Nick */}
        <label htmlFor="nick" className="block text-sm font-medium mb-1">
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

        {/* Avatar */}
        <label htmlFor="avatar" className="block text-sm font-medium mb-1">
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

        {/* Idioma */}
        <label htmlFor="idioma" className="block text-sm font-medium mb-1">
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

        {/* Compartir catálogo */}
        <div className="flex items-center mb-6">
          <input
            id="compartir"
            type="checkbox"
            checked={compartir}
            onChange={() => setCompartir(!compartir)}
            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="compartir" className="ml-2 text-sm">
            Compartir mi catálogo con amigos
          </label>
        </div>

        {/* Guardar */}
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
