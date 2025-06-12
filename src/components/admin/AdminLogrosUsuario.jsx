import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function AdminLogrosUsuario({ usuarios }) {
  const [userId, setUserId] = useState("");
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "", emoji: "" });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  // Cargar logros del usuario seleccionado
  useEffect(() => {
    if (!userId) {
      setLogros([]);
      return;
    }
    setLoading(true);
    supabase
      .from("logros_usuario")
      .select("*")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) setMensaje("Error cargando logros");
        setLogros(data || []);
        setLoading(false);
      });
  }, [userId]);

  // Añadir o modificar logro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editId) {
      // Modificar
      const { error } = await supabase
        .from("logros_usuario")
        .update(form)
        .eq("id", editId);
      if (error) setMensaje("Error modificando logro");
      else setMensaje("Logro modificado");
    } else {
      // Añadir
      const { error } = await supabase
        .from("logros_usuario")
        .insert([{ ...form, user_id: userId }]);
      if (error) setMensaje("Error añadiendo logro");
      else setMensaje("Logro añadido");
    }
    setForm({ nombre: "", descripcion: "", emoji: "" });
    setEditId(null);
    // Recargar logros
    const { data } = await supabase
      .from("logros_usuario")
      .select("*")
      .eq("user_id", userId);
    setLogros(data || []);
    setLoading(false);
  };

  // Eliminar logro
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este logro?")) return;
    setLoading(true);
    await supabase.from("logros_usuario").delete().eq("id", id);
    setLogros((prev) => prev.filter((l) => l.id !== id));
    setMensaje("Logro eliminado");
    setLoading(false);
  };

  // Editar logro
  const handleEditar = (logro) => {
    setForm({
      nombre: logro.nombre,
      descripcion: logro.descripcion,
      emoji: logro.emoji,
    });
    setEditId(logro.id);
  };

  return (
    <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto my-8">
      <h2 className="font-bold mb-4 text-lg">Gestión de logros de usuario</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Selecciona usuario</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">-- Selecciona usuario --</option>
          {(usuarios || []).map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.nick || u.user_id}
            </option>
          ))}
        </select>
      </div>

      {userId && (
        <>
          <h3 className="font-semibold mb-2">Logros actuales</h3>
          {loading ? (
            <p>Cargando logros...</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {logros.length === 0 && (
                <li className="text-gray-500 italic">Sin logros</li>
              )}
              {logros.map((logro) => (
                <li
                  key={logro.id}
                  className="flex items-center gap-2 border-b pb-1"
                >
                  <span className="text-xl">{logro.emoji}</span>
                  <span className="font-medium">{logro.nombre}</span>
                  <span className="text-gray-600 text-sm">
                    {logro.descripcion}
                  </span>
                  <button
                    className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    onClick={() => handleEditar(logro)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    onClick={() => handleEliminar(logro.id)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border-t pt-4 mt-4"
          >
            <h4 className="font-semibold">
              {editId ? "Modificar logro" : "Añadir logro"}
            </h4>
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              className="border px-2 py-1 rounded"
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
              className="border px-2 py-1 rounded"
              required
            />
            <input
              type="text"
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) =>
                setForm((f) => ({ ...f, emoji: e.target.value }))
              }
              className="border px-2 py-1 rounded w-24"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {editId ? "Guardar cambios" : "Añadir logro"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() => {
                    setEditId(null);
                    setForm({ nombre: "", descripcion: "", emoji: "" });
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </>
      )}
      {mensaje && <div className="mt-4 text-sm text-blue-700">{mensaje}</div>}
    </div>
  );
}
