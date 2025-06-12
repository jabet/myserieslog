import React from "react";

export default function AdminUsuarios({
  usuarios,
  loading,
  sortBy,
  sortDir,
  handleSort,
  sortIcon,
  handleEliminar,
}) {
  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <table className="w-full table-auto border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th
            className="border px-2 py-1 cursor-pointer"
            onClick={() => handleSort("user_id")}
          >
            ID{sortIcon("user_id")}
          </th>
          <th
            className="border px-2 py-1 cursor-pointer"
            onClick={() => handleSort("nick")}
          >
            Nick{sortIcon("nick")}
          </th>
          <th className="border px-2 py-1">Avatar</th>
          <th
            className="border px-2 py-1 cursor-pointer"
            onClick={() => handleSort("rol")}
          >
            Rol{sortIcon("rol")}
          </th>
          <th
            className="border px-2 py-1 cursor-pointer"
            onClick={() => handleSort("comparte_catalogo")}
          >
            Comparte catálogo{sortIcon("comparte_catalogo")}
          </th>
          <th
            className="border px-2 py-1 cursor-pointer"
            onClick={() => handleSort("plan")}
          >
            Plan{sortIcon("plan")}
          </th>
          <th className="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.user_id}>
            <td className="border px-2 py-1">{u.user_id}</td>
            <td className="border px-2 py-1">
              {u.nick || <span className="text-gray-400 italic">Sin nick</span>}
            </td>
            <td className="border px-2 py-1">
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <span className="text-gray-400 italic">Sin avatar</span>
              )}
            </td>
            <td className="border px-2 py-1">{u.rol}</td>
            <td className="border px-2 py-1 text-center">
              {u.comparte_catalogo ? "Sí" : "No"}
            </td>
            <td className="border px-2 py-1">
              {u.plan || <span className="text-gray-400 italic">-</span>}
            </td>
            <td className="border px-2 py-1 space-x-2">
              <button
                onClick={() => handleEliminar(u.user_id)}
                className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Borrar usuario
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
