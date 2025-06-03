/**
 * Sistema de Logros del Catalogador
 * Categorías: Colección, Visualización, Racha, Géneros, Tiempo, Especiales
 */

export const CATEGORIAS_LOGROS = {
  COLECCION: 'coleccion',
  VISUALIZACION: 'visualizacion', 
  RACHA: 'racha',
  GENEROS: 'generos',
  TIEMPO: 'tiempo',
  ESPECIALES: 'especiales'
};

export const LOGROS_DEFINICIONES = [
  // === COLECCIÓN ===
  {
    id: 'primera_serie',
    nombre: 'Primer Paso',
    descripcion: 'Añade tu primera serie al catálogo',
    emoji: '🎬',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.series?.total >= 1,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'primera_pelicula',
    nombre: 'Cinéfilo Novato',
    descripcion: 'Añade tu primera película al catálogo',
    emoji: '🎭',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.peliculas?.total >= 1,
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'coleccionista_basico',
    nombre: 'Coleccionista',
    descripcion: 'Reúne 10 series en tu catálogo',
    emoji: '📚',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.series?.total >= 10,
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'cinefilo_basico',
    nombre: 'Amante del Cine',
    descripcion: 'Reúne 25 películas en tu catálogo',
    emoji: '🍿',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.peliculas?.total >= 25,
    color: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'coleccionista_avanzado',
    nombre: 'Bibliógrafo',
    descripcion: 'Reúne 50 series en tu catálogo',
    emoji: '📖',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.series?.total >= 50,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    id: 'cinefilo_avanzado',
    nombre: 'Crítico de Cine',
    descripcion: 'Reúne 100 películas en tu catálogo',
    emoji: '🎞️',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.peliculas?.total >= 100,
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'coleccionista_experto',
    nombre: 'Curador Maestro',
    descripcion: 'Reúne 100 series en tu catálogo',
    emoji: '🏛️',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => stats.series?.total >= 100,
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'archivista',
    nombre: 'Archivista Supremo',
    descripcion: 'Reúne 200 títulos en total (series + películas)',
    emoji: '🗃️',
    categoria: CATEGORIAS_LOGROS.COLECCION,
    condicion: (stats) => (stats.series?.total || 0) + (stats.peliculas?.total || 0) >= 200,
    color: 'bg-gray-50 text-gray-800 border-gray-200'
  },


  // === VISUALIZACIÓN ===
  {
    id: 'primer_episodio',
    nombre: 'Espectador Novato',
    descripcion: 'Ve tu primer episodio',
    emoji: '👀',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.episodios?.vistos >= 1,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'primera_pelicula_vista',
    nombre: 'Primera Función',
    descripcion: 'Ve tu primera película completa',
    emoji: '🎪',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.peliculas?.vistas >= 1,
    color: 'bg-pink-50 text-pink-800 border-pink-200'
  },
  {
    id: 'maraton_basico',
    nombre: 'Maratonista',
    descripcion: 'Ve 100 episodios',
    emoji: '🏃‍♂️',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.episodios?.vistos >= 100,
    color: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  {
    id: 'cinefilo_activo',
    nombre: 'Cinéfilo Activo',
    descripcion: 'Ve 50 películas',
    emoji: '🎬',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.peliculas?.vistas >= 50,
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'maraton_avanzado',
    nombre: 'Devorador de Series',
    descripcion: 'Ve 500 episodios',
    emoji: '🍿',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.episodios?.vistos >= 500,
    color: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'maraton_extremo',
    nombre: 'Adicto a las Series',
    descripcion: 'Ve 1000 episodios',
    emoji: '🔥',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.episodios?.vistos >= 1000,
    color: 'bg-red-50 text-red-900 border-red-300'
  },
  {
    id: 'completista',
    nombre: 'Finalizador',
    descripcion: 'Termina 5 series completas',
    emoji: '✅',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.series?.vistas >= 5,
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'completista_avanzado',
    nombre: 'Terminator',
    descripcion: 'Termina 25 series completas',
    emoji: '🎯',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.series?.vistas >= 25,
    color: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    id: 'completista_maestro',
    nombre: 'Maestro Completista',
    descripcion: 'Termina 50 series completas',
    emoji: '👑',
    categoria: CATEGORIAS_LOGROS.VISUALIZACION,
    condicion: (stats) => stats.series?.vistas >= 50,
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },

  // === RACHA ===
  {
    id: 'primera_racha',
    nombre: 'Primer Día',
    descripcion: 'Ve contenido un día',
    emoji: '📅',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 1,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'racha_semanal',
    nombre: 'En Llamas',
    descripcion: 'Mantén una racha de 7 días',
    emoji: '🔥',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 7,
    color: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'racha_quincenal',
    nombre: 'Disciplinado',
    descripcion: 'Mantén una racha de 15 días',
    emoji: '💪',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 15,
    color: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  {
    id: 'racha_mensual',
    nombre: 'Constancia',
    descripcion: 'Mantén una racha de 30 días',
    emoji: '🏆',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 30,
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'racha_bimestral',
    nombre: 'Perseverante',
    descripcion: 'Mantén una racha de 60 días',
    emoji: '💎',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 60,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'racha_legendaria',
    nombre: 'Leyenda',
    descripcion: 'Mantén una racha de 100 días',
    emoji: '🌟',
    categoria: CATEGORIAS_LOGROS.RACHA,
    condicion: (stats) => stats.racha?.mejor >= 100,
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },

  // === TIEMPO ===
  {
    id: 'tiempo_hora',
    nombre: 'Primera Hora',
    descripcion: 'Acumula 1 hora de contenido visto',
    emoji: '⏰',
    categoria: CATEGORIAS_LOGROS.TIEMPO,
    condicion: (stats) => stats.episodios?.tiempoTotal >= 60,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'tiempo_dia',
    nombre: 'Día Completo',
    descripcion: 'Acumula 24 horas de contenido visto',
    emoji: '📺',
    categoria: CATEGORIAS_LOGROS.TIEMPO,
    condicion: (stats) => stats.episodios?.tiempoTotal >= 1440, // 24 horas en minutos
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'tiempo_semana',
    nombre: 'Semana de Series',
    descripcion: 'Acumula 168 horas de contenido visto',
    emoji: '🗓️',
    categoria: CATEGORIAS_LOGROS.TIEMPO,
    condicion: (stats) => stats.episodios?.tiempoTotal >= 10080, // 1 semana
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'tiempo_mes',
    nombre: 'Mes de Maratón',
    descripcion: 'Acumula 720 horas de contenido visto',
    emoji: '📅',
    categoria: CATEGORIAS_LOGROS.TIEMPO,
    condicion: (stats) => stats.episodios?.tiempoTotal >= 43200, // 1 mes
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'tiempo_año',
    nombre: 'Año de Entretenimiento',
    descripcion: 'Acumula 8760 horas de contenido visto',
    emoji: '🎊',
    categoria: CATEGORIAS_LOGROS.TIEMPO,
    condicion: (stats) => stats.episodios?.tiempoTotal >= 525600, // 1 año
    color: 'bg-red-50 text-red-800 border-red-200'
  },

  // === GÉNEROS ===
  {
    id: 'primer_genero',
    nombre: 'Primer Gusto',
    descripcion: 'Ve contenido de tu primer género',
    emoji: '🎭',
    categoria: CATEGORIAS_LOGROS.GENEROS,
    condicion: (stats) => stats.generosFavoritos?.length >= 1,
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'explorador_generos',
    nombre: 'Explorador',
    descripcion: 'Ve contenido de 5 géneros diferentes',
    emoji: '🧭',
    categoria: CATEGORIAS_LOGROS.GENEROS,
    condicion: (stats) => stats.generosFavoritos?.length >= 5,
    color: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    id: 'conocedor_generos',
    nombre: 'Conocedor',
    descripcion: 'Ve contenido de 10 géneros diferentes',
    emoji: '🎨',
    categoria: CATEGORIAS_LOGROS.GENEROS,
    condicion: (stats) => stats.generosFavoritos?.length >= 10,
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    id: 'experto_generos',
    nombre: 'Experto en Diversidad',
    descripcion: 'Ve contenido de 15 géneros diferentes',
    emoji: '🌈',
    categoria: CATEGORIAS_LOGROS.GENEROS,
    condicion: (stats) => stats.generosFavoritos?.length >= 15,
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },

  // === ESPECIALES ===
  {
    id: 'madrugador',
    nombre: 'Madrugador',
    descripcion: 'Añade contenido en enero (Año nuevo, vida nueva)',
    emoji: '🌅',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      const esEnero = new Date().getMonth() === 0;
      return esEnero && (stats.contenidoNuevoEsteMes || 0) > 0;
    },
    color: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  {
    id: 'activo_mes',
    nombre: 'Mes Activo',
    descripcion: 'Añade 10 títulos en un solo mes',
    emoji: '💫',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => (stats.contenidoNuevoEsteMes || 0) >= 10,
    color: 'bg-pink-50 text-pink-800 border-pink-200'
  },
  // NUEVO: Logro Terminator
  {
    id: 'terminator_saga',
    nombre: 'Terminator',
    descripcion: 'Ve al menos 4 películas de la saga Terminator',
    emoji: '🤖',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) {
        return false;
      }
      
      // Contar películas que contengan "Terminator" en el nombre
      const peliculasTerminator = stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return nombre.includes('terminator') || nombreOriginal.includes('terminator');
      });
      
      return peliculasTerminator.length >= 4;
    },
    color: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'veterano',
    nombre: 'Veterano',
    descripcion: 'Lleva un año usando el catalogador',
    emoji: '🎖️',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      const añoActual = new Date().getFullYear();
      return stats.añoActividad && (añoActual - stats.añoActividad) >= 1;
    },
    color: 'bg-gray-50 text-gray-800 border-gray-200'
  },
  {
    id: 'marvel_fan',
    nombre: 'Superhéroe',
    descripcion: 'Ve 10 películas del MCU',
    emoji: '🦸‍♂️',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas) return false;
      
      const palabrasClaveMarvel = [
        'iron man', 'avengers', 'captain america', 'thor', 'spider-man',
        'black widow', 'doctor strange', 'guardians', 'ant-man',
        'captain marvel', 'black panther', 'hulk', 'hawkeye'
      ];
      
      const peliculasMarvel = stats.peliculasVistas.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const nombreOriginal = (p.nombre_original || '').toLowerCase();
        
        return palabrasClaveMarvel.some(keyword => 
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      });
      
      return peliculasMarvel.length >= 10;
    },
    color: 'bg-red-50 text-red-800 border-red-200'
  },
  {
    id: 'star_wars_fan',
    nombre: 'Jedi Master',
    descripcion: 'Ve 6 películas de Star Wars',
    emoji: '⚔️',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas) return false;
      const peliculasStarWars = stats.peliculasVistas.filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const nombreOriginal = (p.nombre_original || '').toLowerCase();
        return nombre.includes('star wars') || nombreOriginal.includes('star wars');
      });
      return peliculasStarWars.length >= 6;
    },
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  // NUEVO: Logro Trekkie
  {
    id: 'trekkie',
    nombre: 'Trekkie',
    descripcion: 'Ve 6 películas de Star Trek',
    emoji: '🖖',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas) return false;
      // Para contar series y películas:
      const contenidoStarTrek = [
        ...(stats.peliculasVistas || []),
        ...(stats.seriesVistas || [])
      ].filter(p => {
        const nombre = (p.nombre || '').toLowerCase();
        const nombreOriginal = (p.nombre_original || '').toLowerCase();
        return nombre.includes('star trek') || nombreOriginal.includes('star trek');
      });
      return contenidoStarTrek.length >= 6;
    },
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'fantastic_beasts_fan',
    nombre: 'Magizoólogo',
    descripcion: 'Ve 3 películas de Animales Fantásticos',
    emoji: '🦄',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveFB = [
        'animales fantásticos',
        'fantastic beasts'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveFB.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'harry_potter_fan',
    nombre: 'Mago de Hogwarts',
    descripcion: 'Ve 7 películas de Harry Potter',
    emoji: '🧙‍♂️',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveHP = [
        'harry potter',
        'la piedra filosofal',
        'la cámara secreta',
        'el prisionero de azkaban',
        'el cáliz de fuego',
        'la orden del fénix',
        'el misterio del príncipe',
        'las reliquias de la muerte'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveHP.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'lotr_fan',
    nombre: 'El portador del Anillo',
    descripcion: 'Ve 3 películas de El Señor de los Anillos',
    emoji: '💍',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveLOTR = [
        'el señor de los anillos',
        'the lord of the rings',
        'lotr'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveLOTR.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'flash_fan',
    nombre: 'Velocista',
    descripcion: 'Ve 3 películas o series de Flash',
    emoji: '⚡',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (
        (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) &&
        (!stats.seriesVistas || !Array.isArray(stats.seriesVistas))
      ) return 0;

      const titulos = [
        ...(stats.peliculasVistas || []),
        ...(stats.seriesVistas || [])
      ];

      const palabrasClaveFlash = [
        'flash', 'the flash'
      ];

      return titulos.filter(titulo => {
        const nombre = (titulo.nombre || '').toLowerCase();
        const nombreOriginal = (titulo.nombre_original || '').toLowerCase();
        return palabrasClaveFlash.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'antman_fan',
    nombre: 'Ant-Man Fan',
    descripcion: 'Ve 2 películas de Ant-Man',
    emoji: '🐜',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveAntman = [
        'ant-man', 'ant man', 'antman'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveAntman.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'mutante',
    nombre: 'Mutante',
    descripcion: 'Ve 5 películas o series de X-Men',
    emoji: '🧬',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      const peliculas = stats.peliculasVistas || [];
      const series = stats.seriesVistas || [];
      const titulos = [...peliculas, ...series];
      const palabrasClaveXmen = [
        'x-men', 'wolverine', 'logan', 'new mutants', 'deadpool'
      ];
      return titulos.filter(titulo => {
        const nombre = (titulo.nombre || '').toLowerCase();
        const nombreOriginal = (titulo.nombre_original || '').toLowerCase();
        return palabrasClaveXmen.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length >= 5;
    },
    color: 'bg-green-50 text-green-800 border-green-200'
  },
  {
    id: 'hobbit_fan',
    nombre: 'Aventurero de la Comarca',
    descripcion: 'Ve las 3 películas de El Hobbit',
    emoji: '🧙',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveHobbit = [
        'el hobbit',
        'the hobbit'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveHobbit.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length >= 3;
    },
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  },
  {
    id: 'spiderman_fan',
    nombre: 'Amigable Vecino',
    descripcion: 'Ve al menos 3 películas de Spider-Man',
    emoji: '🕷️',
    categoria: CATEGORIAS_LOGROS.ESPECIALES,
    condicion: (stats) => {
      if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

      const palabrasClaveSpiderman = [
        'spider-man',
        'spiderman',
        'el hombre araña'
      ];

      return stats.peliculasVistas.filter(pelicula => {
        const nombre = (pelicula.nombre || '').toLowerCase();
        const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
        return palabrasClaveSpiderman.some(keyword =>
          nombre.includes(keyword) || nombreOriginal.includes(keyword)
        );
      }).length >= 3;
    },
    color: 'bg-red-50 text-red-800 border-red-200'
  }

];

/**
 * Calcula qué logros ha desbloqueado el usuario
 * @param {Object} estadisticas - Estadísticas del usuario
 * @returns {Array} Logros desbloqueados
 */
export function calcularLogrosDesbloqueados(estadisticas) {
  if (!estadisticas) return [];
  
  return LOGROS_DEFINICIONES.filter(logro => {
    try {
      return logro.condicion(estadisticas);
    } catch (error) {
      console.error(`Error evaluando logro ${logro.id}:`, error);
      return false;
    }
  });
}

/**
 * Obtiene logros próximos a desbloquear
 * @param {Object} estadisticas - Estadísticas del usuario
 * @returns {Array} Logros próximos con progreso
 */
export function calcularLogrosProximos(estadisticas) {
  if (!estadisticas) return [];
  
  const desbloqueados = new Set(calcularLogrosDesbloqueados(estadisticas).map(l => l.id));
  
  return LOGROS_DEFINICIONES
    .filter(logro => !desbloqueados.has(logro.id))
    .map(logro => {
      const progreso = calcularProgresoLogro(logro, estadisticas);
      return { ...logro, progreso };
    })
    .filter(logro => logro.progreso > 0)
    .sort((a, b) => b.progreso - a.progreso)
    .slice(0, 8); // Top 8 más próximos
}

/**
 * Calcula el progreso hacia un logro específico
 * @param {Object} logro - Definición del logro
 * @param {Object} stats - Estadísticas del usuario
 * @returns {number} Porcentaje de progreso (0-100)
 */
function calcularProgresoLogro(logro, stats) {
  // Mapeo de logros a sus valores objetivo y actuales
  const progresoMap = {
    // COLECCIÓN
    'primera_serie': { actual: stats.series?.total || 0, objetivo: 1 },
    'primera_pelicula': { actual: stats.peliculas?.total || 0, objetivo: 1 },
    'coleccionista_basico': { actual: stats.series?.total || 0, objetivo: 10 },
    'cinefilo_basico': { actual: stats.peliculas?.total || 0, objetivo: 25 },
    'coleccionista_avanzado': { actual: stats.series?.total || 0, objetivo: 50 },
    'cinefilo_avanzado': { actual: stats.peliculas?.total || 0, objetivo: 100 },
    'coleccionista_experto': { actual: stats.series?.total || 0, objetivo: 100 },
    'archivista': { 
      actual: (stats.series?.total || 0) + (stats.peliculas?.total || 0), 
      objetivo: 200 
    },

    // VISUALIZACIÓN
    'primer_episodio': { actual: stats.episodios?.vistos || 0, objetivo: 1 },
    'primera_pelicula_vista': { actual: stats.peliculas?.vistas || 0, objetivo: 1 },
    'maraton_basico': { actual: stats.episodios?.vistos || 0, objetivo: 100 },
    'cinefilo_activo': { actual: stats.peliculas?.vistas || 0, objetivo: 50 },
    'maraton_avanzado': { actual: stats.episodios?.vistos || 0, objetivo: 500 },
    'maraton_extremo': { actual: stats.episodios?.vistos || 0, objetivo: 1000 },
    'completista': { actual: stats.series?.vistas || 0, objetivo: 5 },
    'completista_avanzado': { actual: stats.series?.vistas || 0, objetivo: 25 },
    'completista_maestro': { actual: stats.series?.vistas || 0, objetivo: 50 },

    // RACHA
    'primera_racha': { actual: stats.racha?.mejor || 0, objetivo: 1 },
    'racha_semanal': { actual: stats.racha?.mejor || 0, objetivo: 7 },
    'racha_quincenal': { actual: stats.racha?.mejor || 0, objetivo: 15 },
    'racha_mensual': { actual: stats.racha?.mejor || 0, objetivo: 30 },
    'racha_bimestral': { actual: stats.racha?.mejor || 0, objetivo: 60 },
    'racha_legendaria': { actual: stats.racha?.mejor || 0, objetivo: 100 },

    // TIEMPO
    'tiempo_hora': { actual: stats.episodios?.tiempoTotal || 0, objetivo: 60 },
    'tiempo_dia': { actual: stats.episodios?.tiempoTotal || 0, objetivo: 1440 },
    'tiempo_semana': { actual: stats.episodios?.tiempoTotal || 0, objetivo: 10080 },
    'tiempo_mes': { actual: stats.episodios?.tiempoTotal || 0, objetivo: 43200 },
    'tiempo_año': { actual: stats.episodios?.tiempoTotal || 0, objetivo: 525600 },

    // GÉNEROS
    'primer_genero': { actual: stats.generosFavoritos?.length || 0, objetivo: 1 },
    'explorador_generos': { actual: stats.generosFavoritos?.length || 0, objetivo: 5 },
    'conocedor_generos': { actual: stats.generosFavoritos?.length || 0, objetivo: 10 },
    'experto_generos': { actual: stats.generosFavoritos?.length || 0, objetivo: 15 },

    // ESPECIALES
    'activo_mes': { actual: stats.contenidoNuevoEsteMes || 0, objetivo: 10 },
    'terminator_saga': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) {
          return 0;
        }
        
        return stats.peliculasVistas.filter(pelicula => {
          const nombre = (pelicula.nombre || '').toLowerCase();
          const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
          return nombre.includes('terminator') || nombreOriginal.includes('terminator');
        }).length;
      })(),
      objetivo: 4
    },
    'marvel_fan': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) {
          return 0;
        }
        
        const palabrasClaveMarvel = [
          'iron man', 'avengers', 'captain america', 'thor', 'spider-man',
          'black widow', 'doctor strange', 'guardians', 'ant-man',
          'captain marvel', 'black panther', 'hulk', 'hawkeye'
        ];
        
        return stats.peliculasVistas.filter(p => {
          const nombre = (p.nombre || '').toLowerCase();
          const nombreOriginal = (p.nombre_original || '').toLowerCase();
          
          return palabrasClaveMarvel.some(keyword => 
            nombre.includes(keyword) || nombreOriginal.includes(keyword)
          );
        }).length;
      })(),
      objetivo: 10
    },
    'star_wars_fan': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) {
          return 0;
        }
        
        return stats.peliculasVistas.filter(p => {
          const nombre = (p.nombre || '').toLowerCase();
          const nombreOriginal = (p.nombre_original || '').toLowerCase();
          return nombre.includes('star wars') || nombreOriginal.includes('star wars');
        }).length;
      })(),
      objetivo: 6
    },
    'trekkie': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) {
          return 0;
        }
        return stats.peliculasVistas.filter(p => {
          const nombre = (p.nombre || '').toLowerCase();
          const nombreOriginal = (p.nombre_original || '').toLowerCase();
          return nombre.includes('star trek') || nombreOriginal.includes('star trek');
        }).length;
      })(),
      objetivo: 6
    },
    'fantastic_beasts_fan': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

        const palabrasClaveFB = [
          'animales fantásticos',
          'fantastic beasts'
        ];

        return stats.peliculasVistas.filter(pelicula => {
          const nombre = (pelicula.nombre || '').toLowerCase();
          const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
          return palabrasClaveFB.some(keyword =>
            nombre.includes(keyword) || nombreOriginal.includes(keyword)
          );
        }).length;
      })(),
      objetivo: 3
    },
    'harry_potter_fan': {
      actual: (() => {
        if (!stats.peliculasVistas || !Array.isArray(stats.peliculasVistas)) return 0;

        const palabrasClaveHP = [
          'harry potter',
          'la piedra filosofal',
          'la cámara secreta',
          'el prisionero de azkaban',
          'el cáliz de fuego',
          'la orden del fénix',
          'el misterio del príncipe',
          'las reliquias de la muerte'
        ];

        return stats.peliculasVistas.filter(pelicula => {
          const nombre = (pelicula.nombre || '').toLowerCase();
          const nombreOriginal = (pelicula.nombre_original || '').toLowerCase();
          return palabrasClaveHP.some(keyword =>
            nombre.includes(keyword) || nombreOriginal.includes(keyword)
          );
        }).length;
      })(),
      objetivo: 7
    }
  };

  const progreso = progresoMap[logro.id];
  if (!progreso) return 0;

  return Math.min(100, Math.round((progreso.actual / progreso.objetivo) * 100));
}

/**
 * Agrupa logros por categoría
 * @param {Array} logros - Lista de logros
 * @returns {Object} Logros agrupados por categoría
 */
export function agruparLogrosPorCategoria(logros) {
  if (!Array.isArray(logros)) return {};
  
  return logros.reduce((grupos, logro) => {
    const categoria = logro.categoria;
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(logro);
    return grupos;
  }, {});
}

/**
 * Obtiene estadísticas de logros
 * @param {Object} estadisticas - Estadísticas del usuario
 * @returns {Object} Resumen de logros
 */
export function obtenerEstadisticasLogros(estadisticas) {
  const desbloqueados = calcularLogrosDesbloqueados(estadisticas);
  const proximos = calcularLogrosProximos(estadisticas);
  
  return {
    total: LOGROS_DEFINICIONES.length,
    desbloqueados: desbloqueados.length,
    porcentaje: Math.round((desbloqueados.length / LOGROS_DEFINICIONES.length) * 100),
    proximos: proximos.length,
    porCategoria: agruparLogrosPorCategoria(desbloqueados)
  };
}

/**
 * Obtiene logros recientes (útil para notificaciones)
 * @param {Object} estadisticasAntes - Estadísticas anteriores
 * @param {Object} estadisticasAhora - Estadísticas actuales
 * @returns {Array} Logros recién desbloqueados
 */
export function obtenerLogrosRecientes(estadisticasAntes, estadisticasAhora) {
  if (!estadisticasAntes || !estadisticasAhora) return [];
  
  const logrosAntes = new Set(calcularLogrosDesbloqueados(estadisticasAntes).map(l => l.id));
  const logrosAhora = calcularLogrosDesbloqueados(estadisticasAhora);
  
  return logrosAhora.filter(logro => !logrosAntes.has(logro.id));
}

/**
 * Obtiene un logro aleatorio para mostrar como motivación
 * @param {Object} estadisticas - Estadísticas del usuario
 * @returns {Object|null} Logro aleatorio próximo
 */
export function obtenerLogroAleatorio(estadisticas) {
  const proximos = calcularLogrosProximos(estadisticas);
  if (proximos.length === 0) return null;
  
  return proximos[Math.floor(Math.random() * proximos.length)];
}