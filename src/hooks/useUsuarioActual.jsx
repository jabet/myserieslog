import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useUsuarioActual() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  return usuario;
}
