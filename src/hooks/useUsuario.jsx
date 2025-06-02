import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUsuario(user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Idioma preferido
      const { data: pref } = await supabase
        .from("preferencias_usuario")
        .select("idioma_preferido")
        .eq("user_id", user.id)
        .single();
      if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);

      // Perfil
      const { data: perfilData } = await supabase
        .from("usuarios")
        .select("nick, avatar, comparte_catalogo, rol")
        .eq("user_id", user.id)
        .maybeSingle();
      setPerfil(perfilData);

      // Lógica para admin (ajusta según tu modelo)
      // Ejemplo: por campo rol en la tabla usuarios
      if (perfilData?.rol === "admin") setEsAdmin(true);
      // O por email:
      // if (user.email === "tuadmin@dominio.com") setEsAdmin(true);

      setLoading(false);
    };

    cargarUsuario();
  }, []);

  return { usuario, idioma, perfil, esAdmin, loading };
}
