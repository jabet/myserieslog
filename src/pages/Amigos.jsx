// src/pages/Amigos.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BuscadorUsuarios from "../components/BuscadorUsuarios";
import Solicitudes from "../components/Solicitudes";

export default function Amigos() {
  const [amistades, setAmistades] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAmistades = async () => {
      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Traer relaciones y perfil del amigo, sin ambigüedades
      const { data, error } = await supabase
        .from("amistades")
        .select(
          `
          usuario1,
          usuario2,
          comparte_catalogo,
          perfil1:usuarios!amistades_usuario1_fkey(nick,avatar),
          perfil2:usuarios!amistades_usuario2_fkey(nick,avatar)
        `
        )
        .or(`usuario1.eq.${user.id},usuario2.eq.${user.id}`);
      if (error) {
        console.error("Error cargando amistades:", error);
        setCargando(false);
        return;
      }

      // Mapear a lista de amigos mostrando siempre el *otro* usuario
      const lista = data.map((rel) => {
        const isUser1 = rel.usuario1 === user.id;
        const amigoId = isUser1 ? rel.usuario2 : rel.usuario1;
        const perfil = isUser1 ? rel.perfil2 : rel.perfil1;
        return {
          id: amigoId,
          nick: perfil.nick,
          avatar: perfil.avatar,
          comparte: rel.comparte_catalogo,
        };
      });

      setAmistades(lista);
      setCargando(false);
    };

    cargarAmistades();
  }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mis Amigos</h1>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Buscar y enviar invitaciones</h2>
          <BuscadorUsuarios />
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Solicitudes entrantes</h2>
          <Solicitudes />
        </div>

        <div>
          <h2 className="font-semibold mb-4">Amigos</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : amistades.length === 0 ? (
            <p className="text-gray-600">No tienes amigos aún.</p>
          ) : (
            <ul className="space-y-2">
              {amistades.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 p-2 border rounded"
                >
                  {a.avatar ? (
                    <img src={a.avatar} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  )}
                  <span className="font-medium">{a.nick}</span>
                  {a.comparte && (
                    <span className="ml-auto text-sm text-gray-500">
                      Comparte catálogo
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
