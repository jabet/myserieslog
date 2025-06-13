import { useState } from "react";
import { Card } from "@radix-ui/themes";
import {
  agruparLogrosPorCategoria,
  CATEGORIAS_LOGROS,
  LOGROS_DEFINICIONES,
} from "../utils/logros";
import LogroItem from "./logros/LogroItem";

const CATEGORIA_TODOS = "TODOS";

const NOMBRES_CATEGORIAS = {
  [CATEGORIA_TODOS]: "Todos",
  [CATEGORIAS_LOGROS.COLECCION]: "Colección",
  [CATEGORIAS_LOGROS.VISUALIZACION]: "Visualización",
  [CATEGORIAS_LOGROS.RACHA]: "Racha",
  [CATEGORIAS_LOGROS.GENEROS]: "Géneros",
  [CATEGORIAS_LOGROS.TIEMPO]: "Tiempo",
  [CATEGORIAS_LOGROS.ESPECIALES]: "Especiales",
};

const DESBLOQUEADOS_POR_DEFECTO = 12;

export default function LogrosDetalle({ logros }) {
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIA_TODOS);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const logrosPorCategoria = agruparLogrosPorCategoria(logros.desbloqueados);
  const proximosPorCategoria = agruparLogrosPorCategoria(logros.proximos);

  // Para la categoría "Todos", mostramos todos los logros definidos
  let todosLogrosOrdenados;
  if (categoriaActiva === CATEGORIA_TODOS) {
    todosLogrosOrdenados = LOGROS_DEFINICIONES.slice()
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((def) => {
        const desbloqueado = logros.desbloqueados.find((l) => l.id === def.id);
        return desbloqueado
          ? { ...def, ...desbloqueado, locked: false }
          : { ...def, locked: true };
      });
  } else {
    todosLogrosOrdenados = (logrosPorCategoria[categoriaActiva] || [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.desbloqueado_en || b.fecha) -
          new Date(a.desbloqueado_en || a.fecha)
      )
      .map((l) => ({ ...l, locked: false }));
  }

  const mostrarLogros = mostrarTodos
    ? todosLogrosOrdenados
    : todosLogrosOrdenados.slice(0, DESBLOQUEADOS_POR_DEFECTO);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Todos los Logros
      </h3>

      {/* Pestañas de categorías */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[CATEGORIA_TODOS, ...Object.values(CATEGORIAS_LOGROS)].map(
          (categoria) => (
            <button
              key={categoria}
              onClick={() => {
                setCategoriaActiva(categoria);
                setMostrarTodos(false);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                categoriaActiva === categoria
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {NOMBRES_CATEGORIAS[categoria]}
            </button>
          )
        )}
      </div>

      {/* Logros de la categoría activa */}
      <div className="space-y-4">
        {todosLogrosOrdenados.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <span>✅</span>
              {categoriaActiva === CATEGORIA_TODOS
                ? "Todos los logros"
                : `Desbloqueados (${todosLogrosOrdenados.length})`}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mostrarLogros.map((logro) => (
                <LogroItem
                  key={logro.id}
                  emoji={logro.emoji}
                  nombre={logro.nombre}
                  fecha={logro.desbloqueado_en || logro.fecha}
                  categoria={NOMBRES_CATEGORIAS[logro.categoria]}
                  color={logro.color}
                  descripcion={logro.descripcion}
                  locked={logro.locked}
                />
              ))}
            </div>
            {todosLogrosOrdenados.length > DESBLOQUEADOS_POR_DEFECTO && (
              <div className="mt-2">
                {!mostrarTodos ? (
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setMostrarTodos(true)}
                  >
                    Ver todos los logros ({todosLogrosOrdenados.length})
                  </button>
                ) : (
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setMostrarTodos(false)}
                  >
                    Mostrar menos
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Próximos */}
        {categoriaActiva !== CATEGORIA_TODOS &&
          proximosPorCategoria[categoriaActiva]?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span>🎯</span>
                En progreso ({proximosPorCategoria[categoriaActiva].length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proximosPorCategoria[categoriaActiva].map((logro) => (
                  <div
                    key={logro.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl opacity-50">{logro.emoji}</span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {logro.nombre}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {logro.descripcion}
                        </p>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progreso</span>
                          <span>{logro.progreso}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${logro.progreso}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Sin logros en esta categoría */}
        {!todosLogrosOrdenados.length &&
          (categoriaActiva === CATEGORIA_TODOS ||
            !proximosPorCategoria[categoriaActiva]?.length) && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🏆</span>
              <p>No tienes logros en esta categoría aún</p>
              <p className="text-sm">
                ¡Sigue explorando para desbloquear nuevos logros!
              </p>
            </div>
          )}
      </div>
    </Card>
  );
}
