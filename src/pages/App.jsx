import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import CatalogoGrid from "../components/CatalogoGrid";
import { useNavigate } from "react-router-dom";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const navigate = useNavigate();

  // Obtener usuario actual
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/login");
      } else {
        setUsuario(user);
      }
    });
  }, [navigate]);

  // Obtener catálogo del usuario
  useEffect(() => {
    if (!usuario) return;

    const cargarCatalogo = async () => {
      const { data, error } = await supabase
        .from("catalogo_usuario")
        .select("*, contenido(*)")
        .eq("user_id", usuario.id)
        .order("creado_en", { ascending: false });

      if (error) console.error("Error cargando catálogo:", error);
      else {
        const procesado = data.map((item) => ({
          ...item.contenido,
          id_catalogo: item.id,
          favorito: item.favorito,
          plataformas: item.plataformas,
          proximo_episodio: item.proximo_episodio,
        }));
        setCatalogo(procesado);
      }
    };

    cargarCatalogo();
  }, [usuario]);

  const eliminarItem = async (idCatalogo) => {
    await supabase.from("catalogo_usuario").delete().eq("id", idCatalogo);
    setCatalogo((prev) =>
      prev.filter((item) => item.id_catalogo !== idCatalogo)
    );
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4">
        <h1 className="text-2xl font-bold mb-4">Mi catálogo</h1>
        <CatalogoGrid catalogo={catalogo} onEliminar={eliminarItem} />
      </main>
    </>
  );
}
