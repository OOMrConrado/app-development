# Turnero - Sistema de Gestión de Turnos

Sistema web para la gestión de turnos de atención al público, similar al sistema de numeración utilizado en bancos y oficinas públicas. Permite a los clientes sacar turnos, a los operadores atenderlos y a los administradores configurar las colas de atención.

## Stack Tecnológico

- **Next.js 15** (App Router) — Framework full-stack (frontend + backend)
- **MongoDB** + **Mongoose** — Base de datos NoSQL
- **NextAuth.js** — Autenticación con JWT
- **Tailwind CSS** + **shadcn/ui** — Interfaz de usuario
- **TypeScript** — Tipado estático

## Arquitectura

Se utiliza una arquitectura **MVC adaptada** dentro de un único proyecto Next.js:

| Capa | Implementación |
|------|---------------|
| **Model** | Schemas de Mongoose (`src/models/`) |
| **View** | Páginas React con App Router (`src/app/`) |
| **Controller** | Route Handlers de Next.js (`src/app/api/`) |

Esta arquitectura es una variante del stack MERN (MongoDB, Express, React, Node.js), donde Next.js reemplaza a Express como servidor y unifica el frontend y backend en un solo proyecto.

## Patrones de Diseño

- **Singleton** — Conexión a MongoDB cacheada para evitar múltiples conexiones en desarrollo (`src/lib/db.ts`)
- **Provider Pattern** — Contexto de sesión con NextAuth envuelve toda la aplicación (`SessionProvider`)
- **MVC** — Separación de responsabilidades entre modelos, vistas y controladores
- **Middleware** — Protección de rutas por rol de usuario con el middleware de Next.js

## Modelo de Datos

### User
Usuarios del sistema con roles diferenciados (admin, operador, cliente).

### Queue (Cola)
Colas de atención configurables con nombre y prefijo para generar códigos de turno.

### Ticket (Turno)
Turnos generados por los clientes con código auto-incremental diario, estados de transición y referencias al cliente y operador.

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Crear/editar/eliminar colas, gestionar usuarios y sus roles |
| **Operador** | Seleccionar cola, llamar al siguiente turno, completar o cancelar atención |
| **Cliente** | Sacar turnos en colas disponibles, ver estado de sus turnos, cancelar turnos en espera |

## Funcionalidades

- Registro e inicio de sesión con autenticación JWT
- Dashboard diferenciado por rol
- CRUD completo de colas de atención (admin)
- Gestión de usuarios y asignación de roles (admin)
- Generación de turnos con código auto-incremental por cola y por día
- Atención de turnos con transiciones de estado (waiting -> attending -> completed/cancelled)
- Pantalla monitor pública que muestra turnos en atención con actualización automática cada 5 segundos
- Protección de rutas por rol con middleware

## Instalación

### Prerrequisitos

- Node.js 18+
- MongoDB (local o Atlas)

### Pasos

1. Clonar el repositorio:
```bash
git clone https://github.com/OOMrConrado/app-development.git
cd app-development/turnero-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno — crear archivo `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/turnero-app
NEXTAUTH_SECRET=una-clave-secreta-segura
NEXTAUTH_URL=http://localhost:3000
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

5. Abrir [http://localhost:3000](http://localhost:3000)

### Primer uso

1. Registrar un usuario desde `/register`
2. Para crear el primer admin, cambiar el rol directamente en MongoDB:
```javascript
db.users.updateOne({ email: "tu@email.com" }, { $set: { role: "admin" } })
```
3. Desde el panel admin, crear colas y asignar roles a otros usuarios

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/           # Páginas de login y registro
│   ├── dashboard/
│   │   ├── admin/        # Panel admin, colas, usuarios
│   │   ├── operador/     # Atención de turnos
│   │   └── cliente/      # Sacar y ver turnos
│   ├── monitor/          # Pantalla pública de turnos
│   └── api/              # Endpoints REST
├── components/           # Componentes React (UI + custom)
├── lib/                  # Conexión DB, config auth, utils
├── models/               # Schemas de Mongoose
├── types/                # Tipos TypeScript personalizados
└── middleware.ts          # Protección de rutas
```

## Próximos Features

- **WebSockets** — Actualización en tiempo real sin polling
- **Notificaciones** — Alertas cuando el turno del cliente está próximo
- **Reportes y estadísticas** — Tiempos promedio de atención, turnos por día, rendimiento por operador
- **Turnos programados** — Reservar turno para una fecha y hora específica
- **Múltiples sucursales** — Soporte para varias ubicaciones con sus propias colas
- **Historial** — Registro completo de turnos atendidos con filtros de búsqueda
