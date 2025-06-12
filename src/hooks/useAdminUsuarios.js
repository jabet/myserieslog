import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useAdminUsuarios(setMensaje) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("user_id");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      let query = supabase
        .from("usuarios")
        .select("user_id, nick, avatar, rol, comparte_catalogo, plan")
        .order(sortBy, { ascending: sortDir === "asc" });
      const { data, error } = await query;
      if (error) {
        setMensaje?.("Error cargando usuarios");
        setUsuarios([]);
      } else {
        setUsuarios(data || []);
      }
      setLoading(false);
    }
    cargar();
  }, [sortBy, sortDir, setMensaje]);

  function handleSort(campo) {
    if (sortBy === campo) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(campo);
      setSortDir("asc");
    }
  }

  function sortIcon(campo) {
    if (sortBy !== campo) return null;
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  async function handleEliminar(user_id) {
    if (!window.confirm("¿Seguro que quieres borrar este usuario?")) return;
    setLoading(true);
    const { error } = await supabase.from("usuarios").delete().eq("user_id", user_id);
    if (error) {
      setMensaje?.("Error al borrar usuario");
    } else {
      setMensaje?.("Usuario borrado correctamente");
      setUsuarios((prev) => prev.filter((u) => u.user_id !== user_id));
    }
    setLoading(false);
  }

  return {
    usuarios,
    loading,
    sortBy,
    sortDir,
    handleSort,
    sortIcon,
    handleEliminar,
  };
}