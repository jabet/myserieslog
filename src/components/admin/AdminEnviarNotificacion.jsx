import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export default function AdminEnviarNotificacion({ usuarios, onNotificacionEnviada }) {
  const [notiUserId, setNotiUserId] = useState("");
  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiMensaje, setNotiMensaje] = useState("");
  const [notiUrl, setNotiUrl] = useState("");
  const [notiStatus, setNotiStatus] = useState("");

  const userOptions = usuarios.map((u) => (
    <option key={u.user_id} value={u.user_id}>
      {u.nick ? u.nick : u.user_id} {u.rol ? `(${u.rol})` : ""}
    </option>
  ));

  const enviarNotificacion = async (e) => {
    e.preventDefault();
    if (!notiUserId) {
      setNotiStatus("Debes seleccionar un usuario.");
      return;
    }
    setNotiStatus("Enviando...");
    const { error } = await supabase
      .from("notificaciones_usuario")
      .insert([
        {
          user_id: notiUserId,
          titulo: notiTitulo,
          mensaje: notiMensaje,
          url: notiUrl,
        },
      ]);
    if (error) {
      setNotiStatus("Error al enviar: " + error.message);
    } else {
      setNotiStatus("¡Notificación enviada!");
      setNotiTitulo("");
      setNotiMensaje("");
      setNotiUrl("");
      setNotiUserId("");
      if (onNotificacionEnviada) onNotificacionEnviada();
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-4 bg-white rounded shadow">
      <h2 className="font-bold mb-2">Enviar notificación de prueba</h2>
      <form onSubmit={enviarNotificacion} className="flex flex-col gap-2">
        <select
          value={notiUserId}
          onChange={(e) => setNotiUserId(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        >
          <option value="">Selecciona usuario</option>
          {userOptions}
        </select>
        <input
          type="text"
          placeholder="Título"
          value={notiTitulo}
          onChange={(e) => setNotiTitulo(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="Mensaje"
          value={notiMensaje}
          onChange={(e) => setNotiMensaje(e.target.value)}
          className="border px-2 py-1 rounded"
          required
        />
        <input
          type="text"
          placeholder="URL destino (opcional)"
          value={notiUrl}
          onChange={(e) => setNotiUrl(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Enviar notificación
        </button>
      </form>
      {notiStatus && <div className="mt-2 text-sm">{notiStatus}</div>}
    </div>
  );
}