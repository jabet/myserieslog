// src/pages/App.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import CatalogoGrid from "../components/CatalogoGrid";
import Footer from "../components/Footer";
import FiltrosCatalogo from "../components/FiltrosCatalogo";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [catalogoFiltrado, setCatalogoFiltrado] = useState([]);
  const [idiomaPreferido, setIdiomaPreferido] = useState("es");

  // Obtener usuario y preferencia de idioma
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data: pref } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (pref?.idioma_preferido) setIdiomaPreferido(pref.idioma_preferido);
      }
    });
  }, []);

  // Cargar catálogo del usuario con estado
  useEffect(() => {
    if (!usuario) return;
    const cargarCatalogo = async () => {
      const { data, error } = await supabase
        .from("catalogo_usuario")
        .select(
          `id, contenido_id, estado, favorito, plataformas,
           contenido:contenido (id, imagen, tipo, anio, finalizada,
             contenido_traducciones!contenido_id(idioma, nombre, sinopsis)
           )`
        )
        .eq("user_id", usuario.id);

      if (error) {
        console.error("Error al cargar catálogo:", error);
        return;
      }

      const resultados = await Promise.all(
        data.map(async (item) => {
          const catalogoId = item.id;
          // Traducción preferida
          const trad = item.contenido.contenido_traducciones?.find(
            (t) => t.idioma === idiomaPreferido
          );
          let nombre, sinopsis;
          if (trad) {
            nombre = trad.nombre;
            sinopsis = trad.sinopsis;
          } else {
            const res = await fetch(
              `https://api.themoviedb.org/3/tv/${item.contenido.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=${idiomaPreferido}`
            );
            const tmdb = await res.json();
            nombre = tmdb.name || tmdb.title || "Sin título";
            sinopsis = tmdb.overview || "";
            await supabase
              .from("contenido_traducciones")
              .upsert([
                {
                  contenido_id: item.contenido.id,
                  idioma: idiomaPreferido,
                  nombre,
                  sinopsis,
                },
              ]);
          }
          return {
            id_catalogo: catalogoId,
            id: item.contenido.id,
            imagen: item.contenido.imagen,
            tipo: item.contenido.tipo,
            anio: item.contenido.anio,
            finalizada: item.contenido.finalizada,
            nombre,
            sinopsis,
            favorito: item.favorito,
            estado: item.estado,
          };
        })
      );

      setCatalogo(resultados);
      setCatalogoFiltrado(resultados);
    };

    cargarCatalogo();
  }, [usuario, idiomaPreferido]);

  // Eliminar item del catálogo
  const eliminarItem = async (contenidoId) => {
    await supabase
      .from("catalogo_usuario")
      .delete()
      .eq("user_id", usuario.id)
      .eq("contenido_id", contenidoId);
    setCatalogo((prev) => prev.filter((c) => c.id !== contenidoId));
    setCatalogoFiltrado((prev) => prev.filter((c) => c.id !== contenidoId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 px-4">
        <FiltrosCatalogo catalogo={catalogo} onFiltrar={setCatalogoFiltrado} />
        <CatalogoGrid catalogo={catalogoFiltrado} onEliminar={eliminarItem} />

      </main>
      <Footer />
    </div>
  );
}
