import { useState } from "react";
import { IconosPlataformas } from "./IconosPlataformas";
import { PLATAFORMAS_DISPONIBLES } from "../constants/plataformas";

export default function SelectorPlataformas({ plataformasSeleccionadas = [], onChange }) {
  const [abierto, setAbierto] = useState(false);

  const togglePlataforma = (plataformaId) => {
    const nuevas = plataformasSeleccionadas.includes(plataformaId)
      ? plataformasSeleccionadas.filter(id => id !== plataformaId)
      : [...plataformasSeleccionadas, plataformaId];
    
    onChange(nuevas);
  };

  const plataformasTexto = plataformasSeleccionadas.length > 0
    ? `${plataformasSeleccionadas.length} plataforma${plataformasSeleccionadas.length > 1 ? 's' : ''} seleccionada${plataformasSeleccionadas.length > 1 ? 's' : ''}`
    : "Seleccionar plataformas";

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {plataformasSeleccionadas.length > 0 ? (
            <>
              <div className="flex -space-x-1">
                {plataformasSeleccionadas.slice(0, 3).map(plataformaId => {
                  const IconComponent = IconosPlataformas[plataformaId];
                  return IconComponent ? (
                    <div key={plataformaId} className="w-6 h-6 bg-white rounded border">
                      <IconComponent />
                    </div>
                  ) : null;
                })}
                {plataformasSeleccionadas.length > 3 && (
                  <div className="w-6 h-6 bg-gray-100 rounded border flex items-center justify-center text-xs">
                    +{plataformasSeleccionadas.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm">{plataformasTexto}</span>
            </>
          ) : (
            <span className="text-gray-500">{plataformasTexto}</span>
          )}
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
          {PLATAFORMAS_DISPONIBLES.map((plataforma) => {
            const seleccionada = plataformasSeleccionadas.includes(plataforma.id);
            const IconComponent = IconosPlataformas[plataforma.id];
            
            return (
              <button
                key={plataforma.id}
                onClick={() => togglePlataforma(plataforma.id)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                  seleccionada ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {IconComponent && <IconComponent />}
                </div>
                <span className={seleccionada ? 'font-medium' : ''}>{plataforma.nombre}</span>
                {seleccionada && (
                  <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}