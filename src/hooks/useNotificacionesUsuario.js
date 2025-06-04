import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useNotificacionesUsuario(usuario) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotificaciones = useCallback(() => {
    if (!usuario?.id) return;
    setLoading(true);
    supabase
      .from("notificaciones_usuario")
      .select("*")
      .eq("user_id", usuario.id)
      .order("creada_en", { ascending: false })
      .then(({ data }) => {
        setNotificaciones(data || []);
        setLoading(false);
      });
  }, [usuario]);

  useEffect(() => {
    fetchNotificaciones();
    // Escuchar evento global para recargar
    const handler = () => fetchNotificaciones();
    window.addEventListener("notificacion-enviada", handler);
    return () => window.removeEventListener("notificacion-enviada", handler);
  }, [fetchNotificaciones]);

  return { notificaciones, loading, refetch: fetchNotificaciones };
}