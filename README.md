# TICOL — Constitución Política de Costa Rica (App Educativa)

Aplicación web educativa sobre la Constitución Política de Costa Rica, con enfoque en accesibilidad y preparada para integrar una API de IA en el futuro (por ahora sin lógica de IA).

## Requisitos
- Docker + Docker Compose

## Iniciar el proyecto
1. En la raíz del proyecto:
   ```bash
   docker-compose up --build
   ```
2. Abrir:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## Variables de entorno
Los servicios usan archivos `.env` por carpeta:
- `backend/.env`
- `frontend/.env`
- `mongo/.env`

Incluimos valores de desarrollo listos para usar. Para producción, cambie `JWT_SECRET`, usuarios/contraseñas, CORS, etc.

## Funcionalidades principales
- UI en español (tema claro por defecto + modo oscuro)
- Autenticación (registro/login) con JWT
- Ruta protegida: Chatbot (solo UI por ahora)
- Favoritos (corazón) persistidos en MongoDB
- Preferencia de tema guardada por usuario en la base de datos
- Búsqueda global + filtros por Títulos/Capítulos/Artículos (datos de muestra)

## Preparado para IA (sin habilitar aún)
La base incluye:
- colección `conversations` (mensajes por usuario)
- componente de Chatbot (solo UI)
- configuración de entorno para futura integración (placeholder)

## Deploy (Vercel + MongoDB Atlas)
Este repositorio está organizado como monorepo:
- Frontend en `frontend/` (Vite)
- Backend en `backend/` (Express)

En Vercel, crea **2 proyectos** apuntando al mismo repo:
1) Proyecto Frontend: Root Directory = `frontend`
2) Proyecto Backend: Root Directory = `backend`

Configura variables de entorno en Vercel:
- Frontend:
  - `VITE_API_BASE_URL` = URL del backend (ej: `https://tu-backend.vercel.app`)
  - `VITE_APP_BRAND_NAME` = `TICOL`
- Backend:
  - `MONGO_URI` = connection string de Atlas
  - `JWT_SECRET` = secreto largo aleatorio
  - `JWT_EXPIRES_IN` = `7d`
  - `CLIENT_ORIGIN` = URL del frontend (ej: `https://tu-frontend.vercel.app`)

Notas:
- El backend incluye `backend/vercel.json` y `backend/api/index.js` para ejecutarse como Serverless Function en Vercel.
- En Atlas, agrega `0.0.0.0/0` en Network Access (solo para pruebas) o limita por IP cuando sea posible.
