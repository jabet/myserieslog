import { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";

// Utilidad para formatear fechas (puedes moverla a un util si la usas en más sitios)
function formatearFecha(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleDateString();
}

export default function useAdminContenidos(setMensaje) {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busquedaId, setBusquedaId] = useState("");

  // Paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 20;

  // Ordenación
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Selección y batch actions
  const [seleccionados, setSeleccionados] = useState([]);
  const [accionBatch, setAccionBatch] = useState("");

  // Cargar contenidos desde Supabase
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      let query = supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion, nombre_original, puntuacion, generos, imagen, sinopsis, duracion, temporadas, episodios_totales"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (filtroTipo) query = query.eq("tipo", filtroTipo);

      const { data, error } = await query;
      if (error) {
        setMensaje?.("Error cargando contenidos");
        setContenidos([]);
      } else {
        setContenidos(data || []);
      }
      setLoading(false);
    }
    cargar();
  }, [filtroTipo, sortBy, sortDir, setMensaje]);

  // Filtrado por búsqueda
  const contenidosFiltrados = useMemo(() => {
    let filtrados = contenidos;
    if (busqueda) {
      filtrados = filtrados.filter((c) =>
        (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    if (busquedaId) {
      filtrados = filtrados.filter((c) =>
        String(c.id).includes(busquedaId)
      );
    }
    return filtrados;
  }, [contenidos, busqueda, busquedaId]);

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(contenidosFiltrados.length / porPagina));
  const contenidosPagina = useMemo(
    () =>
      contenidosFiltrados.slice(
        (pagina - 1) * porPagina,
        pagina * porPagina
      ),
    [contenidosFiltrados, pagina, porPagina]
  );

  // Tipos disponibles para el filtro
  const tiposDisponibles = useMemo(() => {
    const tipos = new Set(contenidos.map((c) => c.tipo).filter(Boolean));
    return Array.from(tipos);
  }, [contenidos]);

  // Ordenación
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

  // Batch actions (ejemplo: borrar seleccionados)
  async function handleBatchAction() {
    if (accionBatch === "borrar") {
      if (!window.confirm("¿Seguro que quieres borrar los seleccionados?")) return;
      setLoading(true);
      const { error } = await supabase
        .from("contenido")
        .delete()
        .in("id", seleccionados);
      if (error) {
        setMensaje?.("Error al borrar contenidos");
      } else {
        setMensaje?.("Contenidos borrados correctamente");
        setContenidos((prev) => prev.filter((c) => !seleccionados.includes(c.id)));
        setSeleccionados([]);
      }
      setLoading(false);
    }
    // Aquí puedes añadir más acciones batch según tu lógica
    // Por ejemplo: actualizar, cargar temporadas, etc.
  }

  // Acción individual: recalcular tipo
  async function handleRecalcularTipo(id) {
    // Implementa aquí tu lógica para recalcular el tipo
    setMensaje?.(`Recalcular tipo para ID ${id} (no implementado)`);
  }

  return {
    contenidos,
    loading,
    tiposDisponibles,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    busquedaId,
    setBusquedaId,
    pagina,
    setPagina,
    totalPaginas,
    contenidosPagina,
    seleccionados,
    setSeleccionados,
    accionBatch,
    setAccionBatch,
    handleBatchAction,
    handleSort,
    sortBy,
    sortIcon,
    formatearFecha,
    handleRecalcularTipo,
    contenidosFiltrados,
  };
}