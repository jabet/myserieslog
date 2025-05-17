import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import MediaCard from "../components/MediaCard";
import CatalogoGrid from "../components/CatalogoGrid";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (data?.idioma_preferido) {
          setIdiomaPreferido(data.idioma_preferido);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const cargarCatalogo = async () => {
      const { data, error } = await supabase
        .from("catalogo_usuario")
        .select(
          `contenido_id, contenido:contenido (id, imagen, tipo, anio, contenido_traducciones!contenido_id(idioma, nombre, sinopsis))`
        )
        .eq("user_id", usuario.id);

      if (error) {
        console.error("Error al cargar catálogo:", error);
        return;
      }

      const resultados = await Promise.all(
        data.map(async (item) => {
          const traduccion = item.contenido.contenido_traducciones?.find(
            (t) => t.idioma === idiomaPreferido
          );

          if (!traduccion) {
            // Descargar desde TMDb si no hay traducción
            const res = await fetch(
              `https://api.themoviedb.org/3/tv/${item.contenido.id}?api_key=${TMDB_API_KEY}&language=${idiomaPreferido}`
            );
            const tmdbData = await res.json();

            if (tmdbData?.name) {
              const nuevaTraduccion = {
                contenido_id: item.contenido.id,
                idioma: idiomaPreferido,
                nombre: tmdbData.name,
                sinopsis: tmdbData.overview,
              };
              await supabase
                .from("contenido_traducciones")
                .upsert([nuevaTraduccion]);
              return {
                id: item.contenido.id,
                imagen: item.contenido.imagen,
                tipo: item.contenido.tipo,
                anio: item.contenido.anio,
                nombre: nuevaTraduccion.nombre,
                sinopsis: nuevaTraduccion.sinopsis,
              };
            }
          }

          return {
            id: item.contenido.id,
            imagen: item.contenido.imagen,
            tipo: item.contenido.tipo,
            anio: item.contenido.anio,
            nombre: traduccion?.nombre || "Sin título",
            sinopsis: traduccion?.sinopsis || "",
          };
        })
      );

      setCatalogo(resultados);
    };

    cargarCatalogo();
  }, [usuario, idiomaPreferido]);

  const eliminarItem = async (idCatalogo) => {
    await supabase.from("catalogo_usuario").delete().eq("id", idCatalogo);
    setCatalogo((prev) =>
      prev.filter((item) => item.id_catalogo !== idCatalogo)
    );
  };

  return (
    <>
      <Navbar />
      <main className="">
        <CatalogoGrid catalogo={catalogo} onEliminar={eliminarItem} />
      </main>
    </>
  );
}
