export default function MensajeFlotante({ texto }) {
  if (!texto) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded shadow-md z-50">
      {texto}
    </div>
  );
}
