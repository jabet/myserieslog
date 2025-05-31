// src/hooks/useProximosEpisodiosUsuario.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function useProximosEpisodiosUsuario(usuario) {
  const [proximosEpisodios, setProximosEpisodios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!usuario?.id) {
      setProximosEpisodios([]);
      return;
    }

    const cargarProximosEpisodios = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("proximo_episodio_usuario")
          .select(
            `
            contenido_id,
            temporada,
            episodio,
            episodios (
              id,
              nombre,
              fecha_emision
            )
          `
          )
          .eq("user_id", usuario.id);

        if (error) {
          console.error("Error cargando próximos episodios:", error);
          setProximosEpisodios([]);
        } else {
          setProximosEpisodios(data || []);
          console.log("Próximos episodios cargados:", data?.length || 0);
        }
      } catch (error) {
        console.error("Error en cargarProximosEpisodios:", error);
        setProximosEpisodios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarProximosEpisodios();
  }, [usuario?.id]);

  return { proximosEpisodios, loading };
}
