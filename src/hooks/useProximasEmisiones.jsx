import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useProximasEmisiones(usuario) {
  const [proximos, setProximos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario?.id) {
      setProximos([]);
      return;
    }

    const cargar = async () => {
      setLoading(true);
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split("T")[0];
      const maxDate = new Date(hoy);
      maxDate.setDate(hoy.getDate() + 90);
      const maxDateStr = maxDate.toISOString().split("T")[0];

      // 1. Obtener el catálogo del usuario
      const { data: catalogo, error: errorCatalogo } = await supabase
        .from("catalogo_usuario")
        .select("contenido_id")
        .eq("user_id", usuario.id)
        .in("estado", ["viendo", "pendiente", "vista"]);

      //console.log("Catalogo:", catalogo);

      if (errorCatalogo) {
        console.error("Error cargando catálogo del usuario:", errorCatalogo);
        setLoading(false);
        return;
      }

      const idsContenido = catalogo.map((c) => c.contenido_id);
      //console.log("IDs de contenido:", idsContenido);

      if (idsContenido.length === 0) {
        setProximos([]);
        setLoading(false);
        return;
      }

      // 2. Obtener episodios próximos (30 días)
      const { data: episodios, error: errorEpisodios } = await supabase
        .from("episodios")
        .select(
          "id, temporada, episodio, fecha_emision, nombre, contenido_id, imagen"
        )
        .in("contenido_id", idsContenido)
        .gte("fecha_emision", hoyStr)
        .lte("fecha_emision", maxDateStr)
        .order("fecha_emision", { ascending: true });

     // console.log("Episodios próximos:", episodios);

      if (errorEpisodios) {
        console.error("Error cargando episodios:", errorEpisodios);
        setLoading(false);
        return;
      }

      // 3. Obtener episodios ya vistos por el usuario
      const { data: vistos } = await supabase
        .from("episodios_vistos")
        .select("episodio_id")
        .eq("user_id", usuario.id);

      //console.log("Episodios vistos:", vistos);

      const idsVistos = vistos?.map((v) => v.episodio_id) || [];

      // 4. Filtrar episodios pendientes (no vistos)
      const pendientes = episodios.filter((e) => !idsVistos.includes(e.id));
      //console.log("Pendientes:", pendientes);

      // 5. Obtener nombres de los contenidos
      const ids = [...new Set(pendientes.map((e) => e.contenido_id))];
      //console.log("IDs de contenidos pendientes:", ids);

      let mapaNombres = {};
      if (ids.length > 0) {
        const { data: contenidos } = await supabase
          .from("contenido")
          .select("id, contenido_traducciones(nombre, idioma)")
          .in("id", ids);

       // console.log("Contenidos:", contenidos);

        if (contenidos) {
          for (const c of contenidos) {
            const traduccion =
              c.contenido_traducciones?.find((t) => t.idioma === "es") ||
              c.contenido_traducciones?.[0];
            mapaNombres[c.id] = traduccion?.nombre || "Sin título";
          }
        }
      }

      // 6. Armar resultado final
      const resultado = pendientes.map((ep) => ({
        ...ep,
        contenido_nombre: mapaNombres[ep.contenido_id] || "Sin título",
      }));

      //console.log("Resultado final:", resultado);

      setProximos(resultado);
      setLoading(false);
    };

    cargar();
  }, [usuario]);

  return { proximos, loading };
}
