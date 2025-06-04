
# MySeriesLog

**MySeriesLog** es una aplicación web para gestionar, compartir y descubrir series y películas, con funcionalidades sociales y estadísticas avanzadas.

## Características principales

- Registro y autenticación de usuarios (Supabase Auth)
- Gestión de catálogo personal de series y películas
- Seguimiento de progreso, estados y logros
- Estadísticas visuales y gráficas (Recharts)
- Red social: búsqueda de amigos, solicitudes, compartir catálogo
- Panel de administración para gestión avanzada
- Preferencias de usuario y soporte multi-idioma

## Estructura del proyecto

- `/src/pages`: Páginas principales de la aplicación (Inicio, Perfil, RedSocial, AdminPanel, etc.)
- `/src/components`: Componentes reutilizables (Navbar, Footer, etc.)
- `/src/hooks`: Custom hooks para lógica de usuario y datos
- `/src/utils`: Utilidades y helpers (Supabase, logros, etc.)

## Scripts útiles

```shell
npm start         # Inicia la aplicación en modo desarrollo
npm run build     # Genera la build de producción
npm run lint      # Linting del código
```

## DEPENDENCIAS

```shell
    npm install @radix-ui/themes
    npm install @radix-ui/react-icons
    npm install @radix-ui/react-card
    npm install @radix-ui/react-popover
    npm install recharts
    npm install react-hook-form
    npm install @hookform/resolvers
    npm install zod
    npm install prop-types
    npm install -g supabase

```

---

## Configuración

1. Clona el repositorio.
2. Instala las dependencias (ver arriba).
3. Configura tus variables de entorno para Supabase en `.env`.
4. Ejecuta `npm start` para desarrollo.

## Stack tecnológico

- **React** + **Vite**
- **Supabase** (Auth, Database, Storage)
- **Radix UI** (componentes accesibles)
- **Recharts** (gráficas)
- **React Hook Form** + **Zod** (formularios y validación)

## Créditos

Desarrollado por Jesús Abet.

---

¿Tienes dudas o sugerencias? ¡Abre un issue o contacta al equipo!
