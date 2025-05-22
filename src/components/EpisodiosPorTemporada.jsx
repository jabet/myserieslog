// src/components/EpisodiosPorTemporada.jsx
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Skeleton, Button } from "@radix-ui/themes";
import ProgresoTemporada from "./ProgresoTemporada";
import MensajeFlotante from "./MensajeFlotante";

export default function EpisodiosPorTemporada({
  contenidoId,
  vistos,
  toggle,
  idioma,
}) {
  const [temporadasAbiertas, setTemporadasAbiertas] = useState({});
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});
  const [cargando, setCargando] = useState({});
  const [temporadasDisponibles, setTemporadasDisponibles] = useState([]);
  const [resumenTemporadas, setResumenTemporadas] = useState({});
  const [resumenVistos, setResumenVistos] = useState({});
  const [mensaje, setMensaje] = useState("");
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE = "https://api.themoviedb.org/3";

  // 1) Cargo totales por temporada (o fallback global a TMDb)
  useEffect(() => {
    const cargarTemporadas = async () => {
      let { data: allEps, error } = await supabase
        .from("episodios")
        .select("temporada")
        .eq("contenido_id", contenidoId);

      // Si no hay nada en BD, tiramos de TMDb para metadata
      if (!error && allEps.length === 0) {
        try {
          const metaRes = await fetch(
            `${TMDB_BASE}/tv/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
          );
          const meta = await metaRes.json();
          const seasonsInfo = meta.seasons || [];

          // Construimos resumenTemporadas sin insertar aún
          allEps = seasonsInfo.flatMap((s) =>
            Array.from({ length: s.episode_count }, () => ({
              temporada: s.season_number,
            }))
          );
        } catch (err) {
          console.error("Error cargando metadata TMDb:", err);
          setMensaje("No se pudieron determinar las temporadas.");
        }
      }

      const resumen = allEps.reduce((acc, { temporada }) => {
        acc[temporada] = (acc[temporada] || 0) + 1;
        return acc;
      }, {});
      setResumenTemporadas(resumen);
      setTemporadasDisponibles(Object.keys(resumen).map(Number).sort());
    };

    cargarTemporadas();
  }, [contenidoId, idioma]);

  // 2) Resumen de vistos por temporada (filtro por contenidoId)
  useEffect(() => {
    const cargarVistos = async () => {
      if (vistos.length === 0) {
        setResumenVistos({});
        return;
      }

      const vistoIds = vistos.map((v) => v.episodio_id);
      const { data: eps } = await supabase
        .from("episodios")
        .select("temporada")
        .eq("contenido_id", contenidoId)
        .in("id", vistoIds);

      const res = eps.reduce((acc, { temporada }) => {
        acc[temporada] = (acc[temporada] || 0) + 1;
        return acc;
      }, {});
      setResumenVistos(res);
    };

    cargarVistos();
  }, [vistos, contenidoId]);

  // 3) Toggle de temporada: carga (o refetch TMDb) sólo al abrir
  const toggleTemporada = async (temporada) => {
    const abierta = !!temporadasAbiertas[temporada];
    setTemporadasAbiertas((p) => ({
      ...p,
      [temporada]: !abierta,
    }));
    if (abierta || episodiosPorTemporada[temporada]) return;

    setCargando((p) => ({ ...p, [temporada]: true }));

    // 3.1 Intentar leer de Supabase
    const { data: epsDB, error: errDB } = await supabase
      .from("episodios")
      .select("*")
      .eq("contenido_id", contenidoId)
      .eq("temporada", temporada)
      .order("episodio");

    let episodiosRaw = [];
    if (!errDB && epsDB.length > 0) {
      episodiosRaw = epsDB;
    } else {
      // 3.2 Si no hay datos, fallback TMDb sólo de esta temporada
      try {
        const seasonRes = await fetch(
          `${TMDB_BASE}/tv/${contenidoId}/season/${temporada}` +
            `?api_key=${TMDB_API_KEY}&language=${idioma}`
        );
        const seasonData = await seasonRes.json();
        episodiosRaw = (seasonData.episodes || []).map((ep) => ({
          contenido_id: contenidoId,
          temporada,
          episodio: ep.episode_number,
          nombre: ep.name,
          fecha_emision: ep.air_date,
          imagen: ep.still_path
            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
            : null,
        }));

        // 3.3 Upsert en BD para futuras lecturas
        const { error: errUpsert } = await supabase
          .from("episodios")
          .upsert(episodiosRaw, {
            onConflict: "contenido_id,temporada,episodio",
          });
        if (errUpsert) console.error("Upsert episodios:", errUpsert);
      } catch (err) {
        console.error("Error TMDb temporada:", err);
        setMensaje("No se pudieron cargar los episodios.");
      }
    }

    // 3.4 Traducir nombres si es necesario
    const traducidos = await Promise.all(
      episodiosRaw.map(async (ep) => {
        const { data: trad } = await supabase
          .from("episodio_traducciones")
          .select("nombre")
          .eq("episodio_id", ep.id)
          .eq("idioma", idioma)
          .maybeSingle();
        return {
          ...ep,
          nombre: trad?.nombre || ep.nombre || "Sin título",
        };
      })
    );

    setEpisodiosPorTemporada((p) => ({
      ...p,
      [temporada]: traducidos,
    }));
    setCargando((p) => ({ ...p, [temporada]: false }));
  };

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="space-y-4">
      <MensajeFlotante texto={mensaje} />

      {temporadasDisponibles.map((temporada) => {
        const total = resumenTemporadas[temporada] || 0;
        const vistosCount = resumenVistos[temporada] || 0;
        const lista = episodiosPorTemporada[temporada] || [];
        const abierta = !!temporadasAbiertas[temporada];
        const todosVistos = total > 0 && vistosCount === total;

        return (
          <div key={temporada} className="border rounded">
            <button
              onClick={() => toggleTemporada(temporada)}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span className="font-semibold">
                Temporada {temporada} ({vistosCount}/{total})
              </span>
              <span>{abierta ? "▾" : "▸"}</span>
            </button>

            {abierta && (
              <div className="px-4 py-2">
                {cargando[temporada] ? (
                  <div className="grid gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded bg-gray-200" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="py-2 flex items-center justify-between">
                      <ProgresoTemporada total={total} vistos={vistosCount} />
                      <Button
                        size="2"
                        color={todosVistos ? "gray" : "blue"}
                        onClick={() => {
                          lista.forEach((ep) => toggle(ep.id));
                          mostrar(
                            todosVistos
                              ? `Se han desmarcado ${total} episodios`
                              : `Se han marcado ${total} episodios como vistos`
                          );
                        }}
                      >
                        {todosVistos
                          ? "Desmarcar todos"
                          : "Marcar todos como vistos"}
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {lista.map((ep) => {
                        const ya = vistos.some((v) => v.episodio_id === ep.id);
                        return (
                          <div
                            key={ep.id}
                            className="flex items-center gap-4 p-3 border rounded shadow-sm hover:shadow-md transition"
                          >
                            {ep.imagen ? (
                              <img
                                src={ep.imagen}
                                alt={`Episodio ${ep.episodio}`}
                                className="w-24 h-14 object-cover rounded"
                              />
                            ) : (
                              <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                Sin imagen
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Episodio {ep.episodio}: {ep.nombre}
                              </p>
                              {ep.fecha_emision && (
                                <p className="text-xs text-gray-500">
                                  {ep.fecha_emision}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                toggle(ep.id);
                                mostrar(
                                  ya
                                    ? `Episodio ${ep.episodio} desmarcado`
                                    : `Episodio ${ep.episode_number} marcado como visto`
                                );
                              }}
                              className={`text-sm px-3 py-1 rounded ${
                                ya
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {ya ? "Visto" : "Marcar"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
