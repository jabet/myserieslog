import { FEATURES } from "../constants/features";
export default function Pro() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Ventajas PRO</h1>
      <ul className="mb-6">
        {FEATURES.PRO.map((f) => (
          <li key={f} className="mb-2">✅ {f}</li>
        ))}
      </ul>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Hazte PRO
      </button>
    </div>
  );
}