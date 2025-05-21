import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import MediaCard from "../components/MediaCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PerfilAmigo() {
  const { amigoId } = useParams();
  const [catalogo, setCatalogo] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("amistades")
        .select("usuario2")
        .eq("usuario1", supabase.auth.user().id)
        .eq("usuario2", amigoId)
        .maybeSingle();
      if (!data) return; // no son amigos

      const { data: cat } = await supabase
        .from("catalogo_usuario")
        .select(
          `contenido_id, contenido:contenido (id, imagen, tipo, anio, contenido_traducciones!contenido_id(idioma, nombre, sinopsis))`
        )
        .eq("user_id", amigoId)
        .eq("estado","viendo"); // por ejemplo sólo lo que está viendo
      // mapear resultados igual que en App.jsx…
      setCatalogo(cat);
    };
    cargar();
  }, [amigoId]);

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 flex flex-wrap gap-4">
        {catalogo.map(c => (
          <MediaCard
            key={c.contenido_id}
            nombre={c.contenido.contenido_traducciones[0]?.nombre}
            imagen={c.contenido.imagen}
            anio={c.contenido.anio}
            onVerDetalle={() => window.location.href = `#/detalle/${c.contenido.id}`}
          />
        ))}
      </main>
      <Footer />
    </>
  );
}
