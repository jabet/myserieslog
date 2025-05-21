import React from 'react';

export default function SelectorEstado({ estado, onChange }) {
  const opciones = [
    { valor: 'pendiente', texto: 'Quiero verla' },
    { valor: 'viendo', texto: 'Viéndola' },
    { valor: 'vista', texto: 'Ya la he visto' },
  ];

  return (
    <select
      value={estado}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 border rounded"
    >
      {opciones.map(o => (
        <option key={o.valor} value={o.valor}>
          {o.texto}
        </option>
      ))}
    </select>
  );
}