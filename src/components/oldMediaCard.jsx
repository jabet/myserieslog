import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PlatformCard from './PlatformCard';
import SipnosisCard from './SipnosisCard';

function calcularDiasRestantes(fecha) {
    if (!fecha) return null;
    const hoy = new Date();
    const objetivo = new Date(fecha);
    const diffMs = objetivo - hoy;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function MediaCard({
    id,
    nombre,
    tipo,
    proximoEpisodio,
    plataformas,
    esFavorito,
    imagen,
    sinopsis,
    anio,
    eliminar,
    actualizarItem,
    modoReducido,
}
) {
    const diasRestantes = calcularDiasRestantes(proximoEpisodio);
    const [valores, setValores] = useState({id, nombre, tipo, sinopsis, anio });


    if (modoReducido) {
        return (
            <Link to={`/detalle/${id}`}>
                <section className="flex items-center float-left max-h-[280px] max-w-[190px]  m-2 shadow mb-4 text-center">
                {imagen ? (
                    <img
                    src={imagen}
                    alt={nombre}
                    className="rounded hover:scale-105 transition duration-300"
                    />
                ) : (
                    <div className="text-gray-500">Sin imagen</div>
                )}
                </section>
            </Link>
        );
    }

    return (
        <>
        <div className="bg-amber-50 p-4 rounded-xl shadow mb-4 transition hover:shadow-lg ">
            <div className="flex mb-2">
                <div className='flex-none max-w-[200px] mr-4'>
                    <div className='relative'>
                        <img
                            src={imagen}
                            alt={`Carátula de ${nombre}`}
                            className="sm:max-w-[200px] mb-3 rounded-lg shadow mx-auto"
                        />
                        <button
                            onClick={() => actualizarItem(id, { favorito: !esFavorito })}
                            className="absolute top-0 right-0 w-0 h-0 border-solid border-t-0 border-r-[50px] border-l-0 border-b-[50px] border-l-transparent border-r-red-600 border-t-transparent border-b-transparent z-50"
                            >
                            <span className="absolute -top-1 -right-12 text-yellow-400 hover:text-yellow-500 text-2xl">
                                {esFavorito ? '★' : '☆'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="flex-auto mb-2 ml-6">
                    <section className='flex items-baseline mb-2'>
                        <h2 className=" text-xl font-semibold mr-2 inline-block "> {valores.nombre} </h2>
                        <span className="text-s"> ({valores.anio}) </span>
                        <span className="w-full text-right text-m text-gray-500 ml-2"> {valores.tipo} </span>
                    </section>

                    <SipnosisCard
                        sinopsis={sinopsis}
                    />

                    <PlatformCard
                        plataformas={plataformas}
                    />

                    <p className="text-xs mb-1 flex gap-2 mt-6">
                        <strong>📅 Próximo episodio:</strong>{" "}
                            {proximoEpisodio ? (
                            <>
                            {proximoEpisodio} ({diasRestantes} día{diasRestantes === 1 ? '' : 's'})
                            {diasRestantes === 0 && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded">
                                ¡Se emite hoy!
                                </span>
                            )}
                            {diasRestantes === 1 && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs rounded ">
                                Mañana
                                </span>
                            )}
                            </>
                        ) : (
                            "N/A"
                        )}  
                    </p>
                    <button
                        onClick={eliminar}
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded items-baseline bottom-0 right-0 float-right"
                        >
                        🗑️ Eliminar
                    </button>
                </div>

            </div>
        </div>
        </>
    );
}


