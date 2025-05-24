import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUsuario(user);

      if (!user) return;

      if (user) {
        const { data: pref } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);

        const { data: perfilData } = await supabase
          .from("usuarios")
          .select("nick, avatar, comparte_catalogo")
          .eq("id", user.id)
          .maybeSingle();
        setPerfil(perfilData);
      }

      setLoading(false);
    };

    cargarUsuario();
  }, []);

  return { usuario, idioma, perfil, loading };
}
