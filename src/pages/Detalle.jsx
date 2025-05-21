// src/pages/Detalle.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";
import SelectorEstado from "../components/SelectorEstado";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";
import { actualizarCampoFinalizada } from "../utils/actualizarFinalizada";

export default function Detalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [vistos, setVistos] = useState([]);
  const [enCatalogo, setEnCatalogo] = useState(false);
  const [estadoCatalogo, setEstadoCatalogo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [idioma, setIdioma] = useState("es");
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Carga usuario y preferencia de idioma
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data: pref } = await supabase
          .from("preferencias_usuario")
          .select("idioma_preferido")
          .eq("user_id", user.id)
          .single();
        if (pref?.idioma_preferido) setIdioma(pref.idioma_preferido);
      }
    });
  }, []);

  // Carga contenido, traducción y estado
  useEffect(() => {
    const cargarItem = async () => {
      // Intentar desde DB
      const { data, error } = await supabase
        .from("contenido")
        .select(`* , catalogo_usuario(user_id, estado)`)
        .eq("id", Number(id))
        .single();

      if (data && !error) {
        // Obtener traducción
        const { data: trad } = await supabase
          .from("contenido_traducciones")
          .select("nombre, sinopsis")
          .eq("contenido_id", data.id)
          .eq("idioma", idioma)
          .maybeSingle();

        // Actualizar estado finalizada
        const finalizada = await actualizarCampoFinalizada(data.id, idioma);

        // Configurar item
        setItem({
          id: data.id,
          nombre: trad?.nombre || data.nombre,
          sinopsis:
            trad?.sinopsis || data.sinopsis || "Sin información disponible.",
          tipo: data.tipo,
          anio: data.anio,
          imagen: data.imagen,
          finalizada: finalizada ?? data.finalizada,
        });

        // Estado catálogo
        const entry = data.catalogo_usuario?.find(
          (c) => c.user_id === usuario?.id
        );
        if (entry) {
          setEnCatalogo(true);
          setEstadoCatalogo(entry.estado);
        }
        return;
      }

      // Fallback TMDb
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=${idioma}`
        );
        const tmdb = await res.json();
        setItem({
          id: tmdb.id,
          nombre: tmdb.name || tmdb.title,
          sinopsis: tmdb.overview || "Sin información disponible.",
          tipo: tmdb.first_air_date ? "Serie" : "Película",
          anio:
            tmdb.first_air_date?.slice(0, 4) ||
            tmdb.release_date?.slice(0, 4) ||
            "Desconocido",
          imagen: tmdb.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
            : null,
          finalizada: tmdb.status === "Ended",
        });
        setEnCatalogo(false);
      } catch (e) {
        console.error("Error obteniendo desde TMDb:", e);
      }
    };

    cargarItem();
  }, [id, usuario, idioma]);

  // Carga episodios vistos
  useEffect(() => {
    if (!usuario) return;
    const cargarVistos = async () => {
      const { data } = await supabase
        .from("episodios_vistos")
        .select("episodio_id")
        .eq("user_id", usuario.id);
      setVistos(data || []);
    };
    cargarVistos();
  }, [usuario]);

  // Toggle catálogo
  const toggleCatalogo = async () => {
    if (!usuario || !item) {
      setMensaje("Inicia sesión para gestionar tu catálogo");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    if (enCatalogo) {
      await supabase
        .from("catalogo_usuario")
        .delete()
        .match({ user_id: usuario.id, contenido_id: item.id });
      setEnCatalogo(false);
      setEstadoCatalogo("");
    } else {
      await supabase
        .from("catalogo_usuario")
        .insert([
          { user_id: usuario.id, contenido_id: item.id, estado: "pendiente" },
        ]);
      setEnCatalogo(true);
      setEstadoCatalogo("pendiente");
    }
  };

  // Cambiar estado en catálogo
  const cambiarEstado = async (nuevo) => {
    if (!usuario) return;
    await supabase
      .from("catalogo_usuario")
      .update({ estado: nuevo })
      .match({ user_id: usuario.id, contenido_id: item.id });
    setEstadoCatalogo(nuevo);
  };

  // Toggle visto/desvisto episodios
  const toggleVisto = async (eid) => {
    if (!usuario) {
      setMensaje("Inicia sesión para marcar episodios");
      setTimeout(() => setMensaje(""), 3000);
      return;
    }
    const exists = vistos.some((v) => v.episodio_id === eid);
    if (exists) {
      await supabase
        .from("episodios_vistos")
        .delete()
        .match({ user_id: usuario.id, episodio_id: eid });
    } else {
      await supabase
        .from("episodios_vistos")
        .insert([{ user_id: usuario.id, episodio_id: eid }]);
    }
    const { data } = await supabase
      .from("episodios_vistos")
      .select("episodio_id")
      .eq("user_id", usuario.id);
    setVistos(data || []);
  };

  if (!item) return <p className="pt-20 p-4 text-center">Cargando...</p>;

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{item.nombre}</h1>
        {item.imagen && (
          <img
            src={item.imagen}
            alt={item.nombre}
            className="w-64 mb-4 rounded shadow"
          />
        )}
        <p className="mb-2">
          <strong>Año:</strong> {item.anio}
        </p>
        {item.finalizada !== undefined && (
          <p className="mb-2">
            <strong>Estado:</strong>{" "}
            {item.finalizada ? "Finalizada" : "En emisión"}
          </p>
        )}
        <p className="mb-4">
          <strong>Sinopsis:</strong> {item.sinopsis}
        </p>

        <button
          onClick={toggleCatalogo}
          className={`mb-4 px-4 py-2 rounded text-white ${
            enCatalogo
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {enCatalogo ? "Quitar del catálogo" : "Añadir a mi catálogo"}
        </button>

        {enCatalogo && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Mi estado:</label>
            <SelectorEstado estado={estadoCatalogo} onChange={cambiarEstado} />
          </div>
        )}

        <MensajeFlotante texto={mensaje} />

        <section className="mt-8">
          <EpisodiosPorTemporada
            contenidoId={item.id}
            vistos={vistos}
            toggle={toggleVisto}
            idioma={idioma}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
