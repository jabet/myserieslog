import { useNavigate } from "react-router-dom";

export default function AvisoLimitePlan({ tipo = "series" }) {
  const navigate = useNavigate();

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded shadow flex flex-col md:flex-row md:items-center gap-4 my-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚠️</span>
        <div>
          <h2 className="text-lg font-semibold text-yellow-800 mb-1">
            Límite alcanzado
          </h2>
          <p className="text-yellow-700">
            Has alcanzado el límite de <span className="font-bold">{tipo}</span> permitido en tu plan actual.
            Para seguir añadiendo más, actualiza a <span className="font-bold text-blue-700">PRO</span>.
          </p>
        </div>
      </div>
      <div className="flex-1 flex md:justify-end">
        <button
          onClick={() => navigate("/pro")}
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold px-5 py-2 rounded shadow hover:from-blue-700 hover:to-blue-500 transition"
        >
          Ver ventajas PRO
        </button>
      </div>
    </div>
  );
}