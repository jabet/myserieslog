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
  const [mensaje, setMensaje] = useState("");
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const TMDB_BASE = "https://api.themoviedb.org/3";

  // 1. Carga inicial de temporadas / fallback a TMDb
  useEffect(() => {
    const cargarTemporadas = async () => {
      // Intentar leer temporadas desde Supabase
      const { data: supaSeasons, error: errSeasons } = await supabase
        .from("episodios")
        .select("temporada")
        .eq("contenido_id", contenidoId);

      if (!errSeasons && supaSeasons.length > 0) {
        const unicas = Array.from(
          new Set(supaSeasons.map((e) => e.temporada))
        ).sort();
        setTemporadasDisponibles(unicas);
        return;
      }

      // No hay episodios en BD → fallback TMDb
      try {
        // 1.1) Obtener cuántas temporadas tiene
        const tvRes = await fetch(
          `${TMDB_BASE}/tv/${contenidoId}?api_key=${TMDB_API_KEY}&language=${idioma}`
        );
        const tvMeta = await tvRes.json();
        const totalTemp = tvMeta.number_of_seasons || 0;
        const seasons = Array.from({ length: totalTemp }, (_, i) => i + 1);
        setTemporadasDisponibles(seasons);

        // 1.2) Descargar episodios de cada temporada
        const allEpisodes = [];
        for (const temporada of seasons) {
          const seasonRes = await fetch(
            `${TMDB_BASE}/tv/${contenidoId}/season/${temporada}?api_key=${TMDB_API_KEY}&language=${idioma}`
          );
          const seasonData = await seasonRes.json();
          for (const ep of seasonData.episodes || []) {
            allEpisodes.push({
              contenido_id: contenidoId,
              temporada,
              episodio: ep.episode_number,
              nombre: ep.name,
              fecha_emision: ep.air_date,
              imagen: ep.still_path
                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                : null,
            });
          }
        }

        // 1.3) Upsert en Supabase usando la clave única (contenido_id,temporada,episodio)
        const { error: errInsert } = await supabase
          .from("episodios")
          .upsert(allEpisodes, {
            onConflict: "contenido_id,temporada,episodio",
          });
        if (errInsert) {
          console.error("Error al volcar episodios en BD:", errInsert);
          mostrar("No se pudieron guardar los episodios.");
        }
      } catch (err) {
        console.error("Error fallback TMDb:", err);
        mostrar("No se pudieron cargar los episodios.");
      }
    };

    cargarTemporadas();
  }, [contenidoId, idioma]);

  // 2. Al abrir una temporada, cargar sus episodios traducidos
  const toggleTemporada = async (temporada) => {
    const yaAbierta = temporadasAbiertas[temporada];
    setTemporadasAbiertas((p) => ({ ...p, [temporada]: !yaAbierta }));
    if (yaAbierta || episodiosPorTemporada[temporada]) return;

    setCargando((p) => ({ ...p, [temporada]: true }));

    const { data: episodios } = await supabase
      .from("episodios")
      .select("*")
      .eq("contenido_id", contenidoId)
      .eq("temporada", temporada)
      .order("episodio");

    const traducidos = await Promise.all(
      episodios.map(async (ep) => {
        const { data: tradu } = await supabase
          .from("episodio_traducciones")
          .select("nombre")
          .eq("episodio_id", ep.id)
          .eq("idioma", idioma)
          .maybeSingle();
        return { ...ep, nombre: tradu?.nombre || ep.nombre || "Sin título" };
      })
    );

    setEpisodiosPorTemporada((p) => ({ ...p, [temporada]: traducidos }));
    setCargando((p) => ({ ...p, [temporada]: false }));
  };

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="space-y-4">
      <MensajeFlotante texto={mensaje} />
      {temporadasDisponibles.length === 0 && (
        <p className="text-center text-gray-500">Sin episodios disponibles.</p>
      )}
      {temporadasDisponibles.map((temporada) => {
        const abierta = temporadasAbiertas[temporada];
        const lista = episodiosPorTemporada[temporada] || [];
        const vistosCount = lista.filter((ep) =>
          vistos.some((v) => v.episodio_id === ep.id)
        ).length;
        const todosVistos = lista.length > 0 && vistosCount === lista.length;

        return (
          <div key={temporada} className="border rounded">
            <button
              onClick={() => toggleTemporada(temporada)}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span className="font-semibold">
                Temporada {temporada} ({vistosCount}/{lista.length})
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
                      <ProgresoTemporada
                        total={lista.length}
                        vistos={vistosCount}
                      />
                      <Button
                        size="2"
                        color={todosVistos ? "gray" : "blue"}
                        onClick={() => {
                          lista.forEach((ep) => {
                            const ya = vistos.some(
                              (v) => v.episodio_id === ep.id
                            );
                            if (todosVistos && ya) toggle(ep.id);
                            if (!todosVistos && !ya) toggle(ep.id);
                          });
                          mostrar(
                            todosVistos
                              ? `Se han desmarcado ${lista.length} episodios`
                              : `Se han marcado ${lista.length} episodios como vistos`
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
                                    : `Episodio ${ep.episodio} marcado como visto`
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
