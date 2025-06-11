import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  // Escucha cambios de sesión para actualizar usuario automáticamente
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      cargarUsuario();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const cargarUsuario = async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) setError(userError);

    setUsuario(user);

    if (!user) {
      setPerfil(null);
      setEsAdmin(false);
      setPlan(null);
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
      .select("nick, avatar, comparte_catalogo, rol, plan")
      .eq("user_id", user.id)
      .maybeSingle();
    setPerfil(perfilData);

    setEsAdmin(perfilData?.rol === "admin");
    setPlan(perfilData?.plan || null);

    setLoading(false);
  };

  // Carga inicial
  useEffect(() => {
    cargarUsuario();
  }, []);

  return { usuario, idioma, perfil, esAdmin, loading, plan, error };
}
