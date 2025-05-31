import { useState } from "react";
import { Card } from "@radix-ui/themes";
import { agruparLogrosPorCategoria, CATEGORIAS_LOGROS } from "../utils/logros";

const NOMBRES_CATEGORIAS = {
  [CATEGORIAS_LOGROS.COLECCION]: "Colección",
  [CATEGORIAS_LOGROS.VISUALIZACION]: "Visualización",
  [CATEGORIAS_LOGROS.RACHA]: "Racha",
  [CATEGORIAS_LOGROS.GENEROS]: "Géneros",
  [CATEGORIAS_LOGROS.TIEMPO]: "Tiempo",
  [CATEGORIAS_LOGROS.ESPECIALES]: "Especiales",
};

export default function LogrosDetalle({ logros }) {
  const [categoriaActiva, setCategoriaActiva] = useState(
    CATEGORIAS_LOGROS.COLECCION
  );

  const logrosPorCategoria = agruparLogrosPorCategoria(logros.desbloqueados);
  const proximosPorCategoria = agruparLogrosPorCategoria(logros.proximos);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Todos los Logros
      </h3>

      {/* Pestañas de categorías */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.values(CATEGORIAS_LOGROS).map((categoria) => (
          <button
            key={categoria}
            onClick={() => setCategoriaActiva(categoria)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              categoriaActiva === categoria
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {NOMBRES_CATEGORIAS[categoria]}
          </button>
        ))}
      </div>

      {/* Logros de la categoría activa */}
      <div className="space-y-4">
        {/* Desbloqueados */}
        {logrosPorCategoria[categoriaActiva]?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
              <span>✅</span>
              Desbloqueados ({logrosPorCategoria[categoriaActiva].length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {logrosPorCategoria[categoriaActiva].map((logro) => (
                <div
                  key={logro.id}
                  className={`p-4 rounded-lg border ${logro.color}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{logro.emoji}</span>
                    <div>
                      <h5 className="font-medium">{logro.nombre}</h5>
                      <p className="text-sm opacity-90">{logro.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximos */}
        {proximosPorCategoria[categoriaActiva]?.length > 0 && (
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
        {!logrosPorCategoria[categoriaActiva]?.length &&
          !proximosPorCategoria[categoriaActiva]?.length && (
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
