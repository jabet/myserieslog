import React from "react";

export default function AdminMigracion({
  migrandoDuraciones,
  migrandoGeneros,
  handleMigrarDuraciones,
  handleMigrarGeneros,
  resultadoMigracion,
  resultadoMigracionGeneros,
  logsMigracion,
}) {
  return (
    <>
      {/* Migración de Duraciones */}
      <section className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            🚀 Migración de Datos
          </h2>
          {migrandoDuraciones && (
            <div className="flex items-center gap-2 text-yellow-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-sm">Procesando...</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">
              Actualizar Duraciones de Episodios
            </h3>
            <p className="text-sm text-yellow-700 mb-3">
              Actualiza las duraciones de todos los episodios existentes desde
              TMDb. Esto puede tardar varios minutos dependiendo del número de
              series.
            </p>

            <button
              onClick={handleMigrarDuraciones}
              disabled={migrandoDuraciones}
              className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                migrandoDuraciones
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {migrandoDuraciones ? (
                <>
                  <span className="animate-pulse mr-2">⏳</span>
                  Migrando duraciones...
                </>
              ) : (
                <>
                  <span className="mr-2">⏱️</span>
                  Migrar Duraciones
                </>
              )}
            </button>
          </div>

          {resultadoMigracion && (
            <div
              className={`p-4 rounded-lg ${
                resultadoMigracion.error
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  resultadoMigracion.error ? "text-red-800" : "text-green-800"
                }`}
              >
                {resultadoMigracion.error
                  ? "❌ Error en la migración"
                  : "✅ Migración completada"}
              </h4>

              {resultadoMigracion.error ? (
                <p className="text-red-700 text-sm">
                  {resultadoMigracion.error}
                </p>
              ) : (
                <div className="text-green-700 text-sm space-y-1">
                  <p>
                    <strong>Total de series procesadas:</strong>{" "}
                    {resultadoMigracion.total}
                  </p>
                  <p>
                    <strong>Actualizaciones exitosas:</strong>{" "}
                    {resultadoMigracion.exitosos}
                  </p>
                  <p>
                    <strong>Errores:</strong> {resultadoMigracion.fallidos}
                  </p>

                  {resultadoMigracion.fallidos > 0 && (
                    <p className="text-yellow-600">
                      ⚠️ Revisa la consola para ver detalles de los errores
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-yellow-600 space-y-1">
            <p>• Esta operación consultará la API de TMDb para cada serie</p>
            <p>
              • Se aplicará un retraso de 250ms entre consultas para respetar
              los límites de la API
            </p>
            <p>
              • Los logs detallados se mostrarán en la consola del navegador
            </p>
          </div>
        </div>
      </section>

      {/* Migración de Géneros */}
      <section className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-800">
            🎭 Migración de Géneros
          </h2>
          {migrandoGeneros && (
            <div className="flex items-center gap-2 text-green-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm">Procesando...</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-green-800 mb-2">
              Actualizar Géneros desde TMDb
            </h3>
            <p className="text-sm text-green-700 mb-3">
              Actualiza los géneros de todo el contenido que no tenga géneros
              asignados desde TMDb.
            </p>

            <button
              onClick={handleMigrarGeneros}
              disabled={migrandoGeneros}
              className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                migrandoGeneros
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {migrandoGeneros ? (
                <>
                  <span className="animate-pulse mr-2">⏳</span>
                  Migrando géneros...
                </>
              ) : (
                <>
                  <span className="mr-2">🎭</span>
                  Migrar Géneros
                </>
              )}
            </button>
          </div>

          {resultadoMigracionGeneros && (
            <div
              className={`p-4 rounded-lg ${
                resultadoMigracionGeneros.error
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <h4
                className={`font-semibold mb-2 ${
                  resultadoMigracionGeneros.error
                    ? "text-red-800"
                    : "text-green-800"
                }`}
              >
                {resultadoMigracionGeneros.error
                  ? "❌ Error en la migración"
                  : "✅ Migración completada"}
              </h4>

              {resultadoMigracionGeneros.error ? (
                <p className="text-red-700 text-sm">
                  {resultadoMigracionGeneros.error}
                </p>
              ) : (
                <div className="text-green-700 text-sm space-y-1">
                  <p>
                    <strong>Total de elementos procesados:</strong>{" "}
                    {resultadoMigracionGeneros.total}
                  </p>
                  <p>
                    <strong>Actualizaciones exitosas:</strong>{" "}
                    {resultadoMigracionGeneros.exitosos}
                  </p>
                  <p>
                    <strong>Errores:</strong>{" "}
                    {resultadoMigracionGeneros.fallidos}
                  </p>
                  {resultadoMigracionGeneros.noEncontrados > 0 && (
                    <p>
                      <strong>No encontrados en TMDb:</strong>{" "}
                      <span className="text-yellow-600">
                        {resultadoMigracionGeneros.noEncontrados}
                      </span>
                    </p>
                  )}

                  {(resultadoMigracionGeneros.fallidos > 0 ||
                    resultadoMigracionGeneros.noEncontrados > 0) && (
                    <p className="text-yellow-600 mt-2">
                      ⚠️ Revisa la consola para ver detalles
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Logs de migración */}
      {logsMigracion && logsMigracion.length > 0 && (
        <div className="bg-gray-900 text-green-200 p-2 mt-2 rounded max-h-40 overflow-y-auto text-xs">
          {logsMigracion.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      )}
    </>
  );
}
