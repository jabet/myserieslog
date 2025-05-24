import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Card } from "@radix-ui/themes";

export default function useCatalogoUsuario(usuario, idiomaPreferido) {
  const [catalogo, setCatalogo] = useState([]);
  const [catalogoFiltrado, setCatalogoFiltrado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NUEVO: Estados para los filtros dinámicos
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [aniosDisponibles, setAniosDisponibles] = useState([]);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);

  useEffect(() => {
    const cargarCatalogo = async () => {
      if (!usuario || !usuario.id) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: errorCatalogo } = await supabase
          .from("catalogo_usuario")
          .select(
            `
              id,
              contenido_id,
              estado,
              favorito,
              puntuacion,
              contenido:contenido (
                id,
                imagen,
                tipo,
                anio,
                nombre,
                contenido_traducciones!contenido_id (
                  idioma,
                  nombre,
                  sinopsis
                )
              )
            `
          )
          .eq("user_id", usuario.id);

        if (errorCatalogo) {
          console.error("Error al cargar catálogo:", errorCatalogo);
          setError(errorCatalogo);
          return;
        }

        if (!data) {
          console.warn("No se han recibido datos del catálogo.");
          return;
        }

        const resultados = await Promise.all(
          data.map(async (item) => {
            const traduccion = item.contenido?.contenido_traducciones?.find(
              (t) => t.idioma === idiomaPreferido
            );

            return {
              id_catalogo: item.id,
              id: item.contenido?.id,
              imagen: item.contenido?.imagen,
              tipo: item.contenido?.tipo,
              anio: item.contenido?.anio,
              nombre:
                traduccion?.nombre || item.contenido?.nombre || "Sin título",
              sinopsis: traduccion?.sinopsis || item.contenido?.sinopsis || "",
              estado: item.estado || "quiero ver",
              favorito: item.favorito || false,
              puntuacion: item.puntuacion ?? 0,
            };
          })
        );

        setCatalogo(resultados);
        setCatalogoFiltrado(resultados);
      } catch (err) {
        console.error("Fallo general en cargarCatalogo:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    cargarCatalogo();
  }, [usuario, idiomaPreferido]);

  // NUEVO: Actualiza los filtros dinámicamente cuando cambia el catálogo
  useEffect(() => {
    if (!catalogo || catalogo.length === 0) {
      setTiposDisponibles([]);
      setAniosDisponibles([]);
      setEstadosDisponibles([]);
      return;
    }
    setTiposDisponibles([...new Set(catalogo.map((item) => item.tipo))]);
    setAniosDisponibles(
      [...new Set(catalogo.map((item) => item.anio))].sort((a, b) => b - a)
    );
    setEstadosDisponibles([...new Set(catalogo.map((item) => item.estado))]);
  }, [catalogo]);

  // FUNCIÓN PARA APLICAR FILTROS
  function aplicarFiltros({ tipo, anio, estado, texto }) {
    let filtrado = [...catalogo];
    if (tipo) filtrado = filtrado.filter((item) => item.tipo === tipo);
    if (anio) filtrado = filtrado.filter((item) => item.anio === anio);
    if (estado) filtrado = filtrado.filter((item) => item.estado === estado);
    if (texto && texto.trim() !== "") {
      const txt = texto.trim().toLowerCase();
      filtrado = filtrado.filter((item) =>
        item.nombre?.toLowerCase().includes(txt)
      );
    }
    setCatalogoFiltrado(filtrado);
  }

  return {
    catalogo: catalogoFiltrado,
    catalogoFiltrado,
    setCatalogoFiltrado,
    tiposDisponibles,
    aniosDisponibles,
    estadosDisponibles,
    loading,
    error,
    aplicarFiltros,

  };
}
