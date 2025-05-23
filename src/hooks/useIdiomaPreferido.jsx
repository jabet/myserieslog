import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useIdiomaPreferido(usuario) {
  const [idioma, setIdioma] = useState("es");

  useEffect(() => {
    if (!usuario) return;

    supabase
      .from("preferencias_usuario")
      .select("idioma_preferido")
      .eq("user_id", usuario.id)
      .single()
      .then(({ data }) => {
        if (data?.idioma_preferido) setIdioma(data.idioma_preferido);
      });
  }, [usuario]);

  return idioma;
}
