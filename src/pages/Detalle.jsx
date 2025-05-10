import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";
import EpisodiosPorTemporada from "../components/EpisodiosPorTemporada";

export default function Detalle() {
  const { id } = useParams(); // id del contenido (TMDb)
  const [item, setItem] = useState(null);
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});
  const [vistos, setVistos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  useEffect(() => {
    if (!usuario) return;

    const cargarItem = async () => {
      const { data } = await supabase
        .from("contenido")
        .select("*")
        .eq("id", parseInt(id))
        .single();
      setItem(data);
    };

    cargarItem();
  }, [id, usuario]);

  useEffect(() => {
    if (!item || !usuario) return;

    const cargarEpisodios = async () => {
      const { data: episodios } = await supabase
        .from("episodios")
        .select("*")
        .eq("contenido_id", item.id)
        .order("temporada, episodio");

      const agrupados = episodios.reduce((acc, ep) => {
        if (!acc[ep.temporada]) acc[ep.temporada] = [];
        acc[ep.temporada].push(ep);
        return acc;
      }, {});
      setEpisodiosPorTemporada(agrupados);

      const { data: vistosData } = await supabase
        .from("episodios_vistos")
        .select("episodio_id")
        .eq("user_id", usuario.id);

      setVistos(vistosData || []);
    };

    cargarEpisodios();
  }, [item, usuario]);

  const toggleVisto = async (episodioId) => {
    const yaVisto = vistos.some((v) => v.episodio_id === episodioId);

    if (yaVisto) {
      await supabase
        .from("episodios_vistos")
        .delete()
        .eq("user_id", usuario.id)
        .eq("episodio_id", episodioId);
    } else {
      await supabase
        .from("episodios_vistos")
        .insert([{ user_id: usuario.id, episodio_id: episodioId }]);
    }

    // Refrescar lista
    const { data } = await supabase
      .from("episodios_vistos")
      .select("episodio_id")
      .eq("user_id", usuario.id);

    setVistos(data || []);
  };

  if (!item) return <p className="pt-20 p-4">Cargando...</p>;

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
        <p className="mb-4">
          <strong>Sinopsis:</strong> {item.sinopsis}
        </p>

        <EpisodiosPorTemporada
          datos={episodiosPorTemporada}
          vistos={vistos}
          toggle={toggleVisto}
        />
      </main>
    </>
  );
}
