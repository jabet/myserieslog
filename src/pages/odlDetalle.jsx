import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "/utils/supabase";
import Navbar from "../components/Navbar";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Detalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  //const [temporadaSeleccionada, setTemporadaSeleccionada] = useState(1);
  //const [episodios, setEpisodios] = useState([]);
  const [episodiosVistos, setEpisodiosVistos] = useState([]);
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});

  useEffect(() => {
    const obtenerTodasTemporadas = async () => {
      if (!item?.id || !item?.id_tmdb || item.tipo !== "Serie") return;

      const resSerie = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id_tmdb}?api_key=${API_KEY}&language=es-ES`
      );
      const serie = await resSerie.json();

      const agrupados = {};

      for (let t = 1; t <= serie.number_of_seasons; t++) {
        const episodios = await cargarEpisodiosTemporada(
          item.id,
          item.id_tmdb,
          t
        );
        agrupados[t] = episodios;
      }

      setEpisodiosPorTemporada(agrupados);
    };

    obtenerTodasTemporadas();
  }, [item]);

  useEffect(() => {
    const cargarItem = async () => {
      const { data, error } = await supabase
        .from("catalogo")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setError("No se pudo cargar el ítem.");
      } else {
        setItem(data);
      }
    };

    cargarItem();
  }, [id]);

  // Al cargar la serie, también carga los vistos desde Supabase
  useEffect(() => {
    const cargarVistos = async () => {
      const { data } = await supabase
        .from("episodios_vistos")
        .select("*")
        .eq("id_catalogo", item.id);
      setEpisodiosVistos(data || []);
    };

    if (item?.id) cargarVistos();
  }, [item]);

  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!item) return <p className="p-4">Cargando...</p>;

  const toggleVisto = async (temporada, episodio) => {
    const yaVisto = episodiosVistos.find(
      (e) => e.temporada === temporada && e.episodio === episodio
    );

    if (yaVisto) {
      // desmarcar
      await supabase
        .from("episodios_vistos")
        .delete()
        .eq("id_catalogo", item.id)
        .eq("temporada", temporada)
        .eq("episodio", episodio);
    } else {
      // marcar como visto
      await supabase
        .from("episodios_vistos")
        .insert([{ id_catalogo: item.id, temporada, episodio }]);
    }

    // Recargar estado
    const { data } = await supabase
      .from("episodios_vistos")
      .select("*")
      .eq("id_catalogo", item.id);
    setEpisodiosVistos(data || []);
  };

  const cargarEpisodiosTemporada = async (idCatalogo, idTMDb, temporada) => {
    // 1. Intentar cargar de Supabase
    const { data: existentes, error } = await supabase
      .from("episodios")
      .select("*")
      .eq("id_catalogo", idCatalogo)
      .eq("temporada", temporada);

    if (error) {
      console.error("Error al consultar episodios en Supabase:", error);
    }

    if (existentes.length > 0) {
      return existentes;
    }

    // 2. Si no existen, consultar TMDb
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${idTMDb}/season/${temporada}?api_key=${API_KEY}&language=es-ES`
    );
    const data = await res.json();

    const episodiosConvertidos = data.episodes.map((ep) => ({
      id_catalogo: idCatalogo,
      temporada: ep.season_number,
      episodio: ep.episode_number,
      nombre: ep.name,
      fecha_emision: ep.air_date,
      imagen: ep.still_path
        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
        : null,
    }));

    // Guardar en Supabase
    const { error: insertError } = await supabase
      .from("episodios")
      .insert(episodiosConvertidos);

    if (insertError) {
      console.error("Error al guardar episodios en Supabase:", insertError);
    }

    return episodiosConvertidos;
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{item.nombre}</h1>
        {item.imagen && (
          <img
            src={item.imagen}
            alt={item.nombre}
            className="mb-4 rounded shadow"
          />
        )}
        <p>
          <strong>📝 Sinopsis:</strong> {item.sinopsis}
        </p>
        <p>
          <strong>🗓️ Año:</strong> {item.anio}
        </p>
        <p>
          <strong>📺 Plataformas:</strong>{" "}
          {item.plataformas?.join(", ") || "N/A"}
        </p>
        {/* Puedes añadir más campos como favorito, próximo episodio, etc. */}
        {Object.entries(episodiosPorTemporada).map(([temporada, episodios]) => {
          const vistos = episodiosVistos.filter(
            (e) => e.temporada === parseInt(temporada)
          );
          const total = episodios.length;
          const cantidadVistos = vistos.length;

          return (
            <div key={temporada} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Temporada {temporada} ({cantidadVistos}/{total} vistos)
              </h2>

              <ul className="space-y-1">
                {episodios.map((ep) => (
                  <li
                    key={`${ep.temporada}-${ep.episodio}`}
                    className="flex gap-4 items-start mb-2"
                  >
                    {ep.imagen ? (
                      <img
                        src={ep.imagen}
                        alt={ep.nombre}
                        className="w-24 h-auto rounded shadow"
                      />
                    ) : (
                      <div className="w-24 h-16 bg-gray-200 rounded" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={episodiosVistos.some(
                            (e) =>
                              e.temporada === ep.temporada &&
                              e.episodio === ep.episodio
                          )}
                          onChange={() =>
                            toggleVisto(ep.temporada, ep.episodio)
                          }
                        />
                        <span className="font-semibold">
                          {ep.episodio}. {ep.nombre}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        📅 Emitido: {ep.fecha_emision || "Sin fecha"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
