import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import ProgresoTemporada from "./ProgresoTemporada";

export default function EpisodiosPorTemporada({
  datos,
  vistos,
  toggle,
  idioma,
}) {
  const [episodios, setEpisodios] = useState(datos);
  const [abierta, setAbierta] = useState(null);
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    const traducirFaltantes = async () => {
      const actualizados = { ...datos };

      for (const [temporada, lista] of Object.entries(datos)) {
        const sinTraduccion = lista.filter(
          (ep) => !ep.nombre || ep.nombre.startsWith("Sin título")
        );

        if (sinTraduccion.length > 0) {
          const res = await fetch(
            `https://api.themoviedb.org/3/tv/${lista[0].contenido_id}/season/${temporada}?api_key=${TMDB_API_KEY}&language=${idioma}`
          );
          const tmdb = await res.json();

          for (const ep of lista) {
            const existente = await supabase
              .from("episodio_traducciones")
              .select("*")
              .eq("episodio_id", ep.id)
              .eq("idioma", idioma)
              .maybeSingle();

            if (!existente.data) {
              const tmdbEp = tmdb.episodes?.find(
                (e) => e.episode_number === ep.episodio
              );
              if (tmdbEp?.name) {
                await supabase.from("episodio_traducciones").upsert(
                  [
                    {
                      episodio_id: ep.id,
                      idioma,
                      nombre: tmdbEp.name,
                    },
                  ],
                  {
                    onConflict: "episodio_id,idioma",
                  }
                );

                ep.nombre = tmdbEp.name;
              }
            }
          }
        }
      }

      setEpisodios(actualizados);
    };

    traducirFaltantes();
  }, [datos, idioma]);

  const marcarTodos = (lista) => {
    lista.forEach((ep) => {
      if (!vistos.some((v) => v.episodio_id === ep.id)) {
        toggle(ep.id);
      }
    });
  };

  return (
    <div className="space-y-4">
      {Object.entries(episodios).map(([temporada, lista]) => {
        const vistosTemporada = lista.filter((ep) =>
          vistos.some((v) => v.episodio_id === ep.id)
        ).length;

        return (
          <div key={temporada} className="border rounded">
            <button
              onClick={() =>
                setAbierta(abierta === temporada ? null : temporada)
              }
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span className="font-semibold">Temporada {temporada}</span>
              <span>{abierta === temporada ? "▾" : "▸"}</span>
            </button>
            <div className="px-4 py-2 text-sm text-gray-500 grid gap-2  grid-cols-4 align-middle">
              <div className="flex items-center gap-2 col-span-3">
                <ProgresoTemporada
                  total={lista.length}
                  vistos={vistosTemporada}
                />
              </div>
              <button
                onClick={() => marcarTodos(lista)}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 "
              >
                Marcar todos como vistos
              </button>
            </div>

            {abierta === temporada && (
              <div className="p-4 space-y-4">
                <div className="grid gap-3">
                  {lista.map((ep) => (
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
                          Episodio {ep.episodio}: {ep.nombre || "Sin título"}
                        </p>
                        {ep.fecha_emision && (
                          <p className="text-xs text-gray-500">
                            {ep.fecha_emision}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggle(ep.id)}
                        className={`text-sm px-3 py-1 rounded ${
                          vistos.some((v) => v.episodio_id === ep.id)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {vistos.some((v) => v.episodio_id === ep.id)
                          ? "Visto"
                          : "Marcar"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
