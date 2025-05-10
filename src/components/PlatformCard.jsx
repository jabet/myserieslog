import React from 'react';

export default function PlatformCard({
    plataformas,
    editando,
    guardarCampo,
    manejarCambio,
})
{ 
    return (
        <section className="mb-2 mt-6">
            <p className="text-sm">
                <strong>📺 Plataformas:</strong>
                {editando ? (
                <input
                    type="text"
                    value={plataformas.join(', ') || ''}
                    onChange={(e) =>
                        manejarCambio('plataformas', e.target.value.split(',').map(p => p.trim()))
                    }
                    onBlur={() => guardarCampo('plataformas')}
                    className="w-full border rounded p-2 text-sm"
                />
                ) : (
                `${plataformas || 'No especificadas'}`
                )}
            </p>
        </section>
    )  
}