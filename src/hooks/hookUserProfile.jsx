import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export function useUsuarioPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nick, avatar")
          .eq("id", user.id)
          .single();
        setPerfil(data);
      }
    });
  }, []);

  return { usuario, perfil };
}