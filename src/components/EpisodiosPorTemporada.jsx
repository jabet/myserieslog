import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import MensajeFlotante from "./MensajeFlotante";
import ProgresoTemporada from "./ProgresoTemporada";

export default function EpisodiosPorTemporada({
  contenidoId,
  vistos,
  toggle,
  toggleMultiples,
  idioma,
  usuario,
  enCatalogo,
}) {
  const [temporadasAbiertas, setTemporadasAbiertas] = useState({});
  const [episodiosPorTemporada, setEpisodiosPorTemporada] = useState({});
  const [temporadasDisponibles, setTemporadasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar todos los episodios agrupados por temporada al inicio
  useEffect(() => {
    const cargarEpisodios = async () => {
      const { data, error } = await supabase
        .from("episodios")
        .select("*")
        .eq("contenido_id", contenidoId);

      if (error) return;

      // Agrupa episodios por temporada
      const agrupados = {};
      data.forEach((ep) => {
        if (!agrupados[ep.temporada]) agrupados[ep.temporada] = [];
        agrupados[ep.temporada].push(ep);
      });
      setEpisodiosPorTemporada(agrupados);

      // Calcula temporadas disponibles
      const normales = [
        ...new Set(
          data
            .filter(
              (e) =>
                (!e.especial || e.especial === "false") &&
                !isNaN(Number(e.temporada)) &&
                Number(e.temporada) !== 0
            )
            .map((e) => Number(e.temporada))
        ),
      ];
      const especiales = data.some(
        (e) => e.especial === true && e.temporada === 0
      )
        ? [0]
        : [];
      const todas = [...normales.sort((a, b) => a - b), ...especiales];
      setTemporadasDisponibles(todas);

      // Log de las temporadas totales
      // console.log("Temporadas totales:", todas.length, "Temporadas:", todas);
    };

    cargarEpisodios();
  }, [contenidoId, idioma]);

  const mostrar = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  const normales = temporadasDisponibles.filter((t) => t !== 0);
  const especiales = temporadasDisponibles.includes(0);

  const renderTemporada = (temporada, esEspecial = false) => {
    const abierta = !!temporadasAbiertas[temporada];
    const lista = episodiosPorTemporada[temporada] || [];
    const total = lista.length;
    const vistosCount = lista.filter((ep) =>
      Array.isArray(vistos) ? vistos.includes(ep.id) : false
    ).length;
    const todosVistos = total > 0 && vistosCount === total;

    const toggleTodos = async () => {
      if (!usuario) {
        mostrar("Debes iniciar sesión para marcar episodios como vistos");
        return;
      }
      if (!enCatalogo) {
        mostrar(
          "Debes añadir a tu catálogo antes de marcarlos episodios como vistos"
        );
        return;
      }

      const episodiosIds = lista.map((ep) => ep.id);

      if (todosVistos) {
        // Desmarcar todos
        const aDesmarcar = episodiosIds.filter((id) => vistos.includes(id));
        await toggleMultiples(aDesmarcar, false);
        mostrar("Todos los episodios desmarcados");
      } else {
        // Marcar todos
        const aMarcar = episodiosIds.filter((id) => !vistos.includes(id));
        await toggleMultiples(aMarcar, true);
        mostrar("Todos los episodios marcados como vistos");
      }
    };

    return (
      <div
        key={temporada}
        className={`border rounded${esEspecial ? " bg-yellow-50" : ""}`}
      >
        <button
          onClick={() =>
            setTemporadasAbiertas((p) => ({
              ...p,
              [temporada]: !abierta,
            }))
          }
          className={`w-full flex justify-between items-center px-4 py-2 ${
            esEspecial
              ? "bg-yellow-100 hover:bg-yellow-200"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span className="font-semibold">
            {esEspecial
              ? `Capítulos especiales (${vistosCount}/${total})`
              : `Temporada ${temporada} (${vistosCount}/${total})`}
          </span>
          <span>{abierta ? "▾" : "▸"}</span>
        </button>

        {abierta && (
          <div className="px-4 py-2">
            <div className="mb-2 flex justify-end">
              {usuario && (
                <button
                  onClick={toggleTodos}
                  className={`text-xs px-3 py-1 rounded ${
                    todosVistos
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {todosVistos ? "Desmarcar todos" : "Marcar todos como vistos"}
                </button>
              )}
            </div>
            <div className="py-2 flex items-center justify-between">
              <ProgresoTemporada total={total} vistos={vistosCount} />
            </div>
            <div className="grid gap-3">
              {lista.map((ep) => {
                const ya = Array.isArray(vistos)
                  ? vistos.includes(ep.id)
                  : false;
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
                    {usuario ? (
                      <button
                        onClick={async () => {
                          if (!enCatalogo) {
                            console.log("Esta en el catalogo:", enCatalogo);
                            mostrar(
                              "Debes añadir a tu catalogo antes de marcarlos episodios como vistos"
                            );
                            return;
                          }
                          await toggle(ep.id);
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
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <MensajeFlotante texto={mensaje} />
      {normales.map((temporada) => renderTemporada(temporada, false))}
      {especiales &&
        episodiosPorTemporada[0]?.length > 0 &&
        renderTemporada(0, true)}
    </div>
  );
}
