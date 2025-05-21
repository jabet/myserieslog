import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Skeleton, Button } from "@radix-ui/themes";
import ProgresoTemporada from "./ProgresoTemporada";
import MensajeFlotante from "./MensajeFlotante";
import { actualizarCampoFinalizada } from "../utils/actualizarFinalizada";

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

  useEffect(() => {
    const cargarTemporadas = async () => {
      const { data, error } = await supabase
        .from("episodios")
        .select("temporada")
        .eq("contenido_id", contenidoId);

      if (!error && data) {
        const unicas = Array.from(new Set(data.map((e) => e.temporada))).sort();
        setTemporadasDisponibles(unicas);
      }

      // ✅ También actualiza el campo "finalizada" desde TMDb
      await actualizarCampoFinalizada(contenidoId);
    };

    cargarTemporadas();
  }, [contenidoId]);

  const toggleTemporada = async (temporada) => {
    const yaAbierta = temporadasAbiertas[temporada];
    setTemporadasAbiertas((prev) => ({ ...prev, [temporada]: !yaAbierta }));

    if (yaAbierta || episodiosPorTemporada[temporada]) return;

    setCargando((prev) => ({ ...prev, [temporada]: true }));

    const { data: episodios } = await supabase
      .from("episodios")
      .select("*")
      .eq("contenido_id", contenidoId)
      .eq("temporada", temporada)
      .order("episodio");

    const traducidos = await Promise.all(
      episodios.map(async (ep) => {
        const { data: traduccion } = await supabase
          .from("episodio_traducciones")
          .select("nombre")
          .eq("episodio_id", ep.id)
          .eq("idioma", idioma)
          .maybeSingle();

        return {
          ...ep,
          nombre: traduccion?.nombre || ep.nombre || "Sin título",
        };
      })
    );

    setEpisodiosPorTemporada((prev) => ({
      ...prev,
      [temporada]: traducidos,
    }));

    setCargando((prev) => ({ ...prev, [temporada]: false }));
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="space-y-4">
      <MensajeFlotante texto={mensaje} />
      {temporadasDisponibles.map((temporada) => {
        const abierta = temporadasAbiertas[temporada];
        const lista = episodiosPorTemporada[temporada] || [];
        const vistosTemporada = lista.filter((ep) =>
          vistos.some((v) => v.episodio_id === ep.id)
        ).length;
        const todosVistos =
          lista.length > 0 && vistosTemporada === lista.length;

        return (
          <div key={temporada} className="border rounded">
            <button
              onClick={() => toggleTemporada(temporada)}
              className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200"
            >
              <span className="font-semibold">Temporada {temporada}</span>
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
                        vistos={vistosTemporada}
                      />
                      <Button
                        size="2"
                        color={todosVistos ? "gray" : "blue"}
                        onClick={() => {
                          lista.forEach((ep) => {
                            const yaVisto = vistos.some(
                              (v) => v.episodio_id === ep.id
                            );
                            if (todosVistos && yaVisto) toggle(ep.id);
                            if (!todosVistos && !yaVisto) toggle(ep.id);
                          });
                          mostrarMensaje(
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
                        const yaVisto = vistos.some(
                          (v) => v.episodio_id === ep.id
                        );
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
                                Episodio {ep.episodio}:{" "}
                                {ep.nombre || "Sin título"}
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
                                mostrarMensaje(
                                  yaVisto
                                    ? `Episodio ${ep.episodio} desmarcado`
                                    : `Episodio ${ep.episodio} marcado como visto`
                                );
                              }}
                              className={`text-sm px-3 py-1 rounded ${
                                yaVisto
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {yaVisto ? "Visto" : "Marcar"}
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
