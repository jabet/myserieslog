import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";

export default function PreferenciasUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
      if (user) cargarPreferencias(user.id);
    });
  }, []);

  const cargarPreferencias = async (userId) => {
    const { data } = await supabase
      .from("preferencias_usuario")
      .select("idioma_preferido")
      .eq("user_id", userId)
      .single();

    if (data) setIdiomaPreferido(data.idioma_preferido);
  };

  const guardarPreferencias = async () => {
    setGuardando(true);
    await supabase
      .from("preferencias_usuario")
      .upsert([{ user_id: usuario.id, idioma_preferido: idiomaPreferido }]);
    setGuardando(false);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Preferencias de Usuario</h1>

        <label className="block mb-2 font-medium">Idioma preferido:</label>
        <select
          value={idiomaPreferido}
          onChange={(e) => setIdiomaPreferido(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="fr">Francés</option>
          <option value="de">Alemán</option>
          <option value="ja">Japonés</option>
        </select>

        <button
          onClick={guardarPreferencias}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </main>
    </>
  );
}
