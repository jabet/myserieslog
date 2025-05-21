// src/pages/PerfilAmigo.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import MediaCard from "../components/MediaCard";
import Footer from "../components/Footer";

export default function PerfilAmigo() {
  const { amigoId } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [perfilAmigo, setPerfilAmigo] = useState(null);
  const [idioma, setIdioma] = useState("es");
  const [comparte, setComparte] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // Carga usuario y preferencia de idioma
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);
      const { data: pref } = await supabase
        .from("preferencias_usuario")
        .select("idioma_preferido")
        .eq("user_id", user.id)
        .single();
      if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);
    });
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const cargarPerfil = async () => {
      setLoading(true);
      // 1) Carga datos de perfil del amigo
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nick, avatar")
        .eq("id", amigoId)
        .single();
      setPerfilAmigo(perfil);

      // 2) Verifica relación de amistad y si comparte catálogo
      const { data: rel } = await supabase
        .from("amistades")
        .select("comparte_catalogo")
        .or(
          `and(usuario1.eq.${usuario.id},usuario2.eq.${amigoId}),` +
          `and(usuario1.eq.${amigoId},usuario2.eq.${usuario.id})`
        )
        .maybeSingle();
      if (!rel) {
        setMensaje("No sois amigos");
        setLoading(false);
        return;
      }
      if (!rel.comparte_catalogo) {
        setMensaje("Este usuario no comparte su catálogo");
        setLoading(false);
        return;
      }
      setComparte(true);

      // 3) Carga el catálogo del amigo
      const { data: items } = await supabase
        .from("catalogo_usuario")
        .select(
          `contenido_id, 
           contenido:contenido (
             id, imagen, tipo, anio,
             contenido_traducciones!contenido_id(idioma, nombre, sinopsis)
           )`
        )
        .eq("user_id", amigoId);

      // 4) Mapear traducciones al idioma preferido
      const resultados = items.map((it) => {
        const trad =
          it.contenido.contenido_traducciones?.find(
            (t) => t.idioma === idioma
          ) || {};
        return {
          id: it.contenido.id,
          nombre: trad.nombre || "Sin título",
          sinopsis: trad.sinopsis || "Sin información disponible.",
          imagen: it.contenido.imagen,
          anio: it.contenido.anio,
        };
      });

      setCatalogo(resultados);
      setLoading(false);
    };

    cargarPerfil();
  }, [usuario, amigoId, idioma]);

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {perfilAmigo
            ? `Catálogo de ${perfilAmigo.nick}`
            : "Catálogo de usuario"}
        </h1>

        {loading && <p>Cargando catálogo...</p>}
        {!loading && mensaje && (
          <p className="text-red-600">{mensaje}</p>
        )}

        {!loading && comparte && catalogo.length === 0 && (
          <p className="text-gray-600">No hay contenidos en su catálogo.</p>
        )}

        {!loading && comparte && catalogo.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {catalogo.map((c) => (
              <MediaCard
                key={c.id}
                nombre={c.nombre}
                imagen={c.imagen}
                anio={c.anio}
                onVerDetalle={() =>
                  navigate(`/detalle/${c.id}`)
                }
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
