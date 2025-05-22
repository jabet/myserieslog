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

  // 1) Cargo usuario actual y su idioma preferido
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUsuario(user);
      const { data: pref } = await supabase
        .from("preferencias_usuario")
        .select("idioma_preferido")
        .eq("user_id", user.id)
        .single();
      if (pref?.idioma_preferido) {
        setIdioma(pref.idioma_preferido);
      }
    });
  }, []);

  // 2) Cargo perfil del amigo, compruebo amistad y permiso de compartir, luego catálogo
  useEffect(() => {
    if (!usuario) return;

    const cargarPerfil = async () => {
      setLoading(true);
      setMensaje("");
      setComparte(false);
      setCatalogo([]);

      // 2.1) Perfil del amigo con su flag comparte_catalogo
      const { data: perfil, error: errPerfil } = await supabase
        .from("usuarios")
        .select("nick, avatar, comparte_catalogo")
        .eq("id", amigoId)
        .single();

      if (errPerfil || !perfil) {
        setMensaje("Usuario no encontrado.");
        setLoading(false);
        return;
      }
      setPerfilAmigo(perfil);

      // 2.2) Verificar que sois amigos
      const { data: rel } = await supabase
        .from("amistades")
        .select("estado, comparte_catalogo")
        .or(
          `and(usuario1.eq.${usuario.id},usuario2.eq.${amigoId}),` +
          `and(usuario1.eq.${amigoId},usuario2.eq.${usuario.id})`
        )
        .maybeSingle();

      if (!rel || rel.estado !== "aceptada") {
        setMensaje("No sois amigos.");
        setLoading(false);
        return;
      }

      // 2.3) Comprobar permiso individual de compartir
      if (!rel.comparte_catalogo) {
        setMensaje("Este usuario no comparte su catálogo.");
        setLoading(false);
        return;
      }
      setComparte(true);

      // 2.4) Cargar catálogo del amigo
      const { data: items, error: errCat } = await supabase
        .from("catalogo_usuario")
        .select(
          `contenido_id,
           contenido:contenido (
             id,
             imagen,
             tipo,
             anio,
             contenido_traducciones!contenido_id(idioma, nombre, sinopsis)
           )`
        )
        .eq("user_id", amigoId);

      if (errCat) {
        console.error("Error cargando catálogo amigo:", errCat);
        setMensaje("No se pudo cargar el catálogo.");
        setLoading(false);
        return;
      }

      // 2.5) Mapear al formato de MediaCard
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
          tipo: it.contenido.tipo,
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
                tipo={c.tipo}
                onVerDetalle={() => navigate(`/detalle/${c.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
