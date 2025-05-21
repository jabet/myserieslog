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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("amistades")
        .select("usuario1, usuario2, comparte_catalogo, usuario2:usuarios(nick,avatar)")
        .or(`usuario1.eq.${user.id},usuario2.eq.${user.id}`);
      if (error) console.error("Error cargando amistades:", error);
      if (data) {
        const lista = data.map(rel => {
          const amigo = rel.usuario1 === user.id ? rel.usuario2 : rel.usuario1;
          const perfil = rel.usuario2;
          return { id: amigo, nick: perfil.nick, avatar: perfil.avatar, comparte: rel.comparte_catalogo };
        });
        setAmistades(lista);
      }
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
          <h2 className="font-semibold mb-2">Amigos</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : (
            <ul className="space-y-2">
              {amistades.map(a => (
                <li key={a.id} className="flex items-center gap-2">
                  {a.avatar && <img src={a.avatar} className="w-8 h-8 rounded-full" />}
                  <span>{a.nick}</span>
                  {a.comparte && (
                    <span className="ml-auto text-sm text-gray-500">Compartió catálogo</span>
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
