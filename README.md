# Datee-Katherineee 🌹

Planificador de citas románticas: crea *dates*, elige la fecha de cada salida y guarda los recuerdos con fotos.

**Stack:** Vite + React + TypeScript + Tailwind CSS v4 + Firebase (Firestore + Storage) + GSAP + React Router

## Guía de configuración de Firebase (primera vez)

### 1. Crear el proyecto

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) e inicia sesión con tu cuenta Google.
2. Clic en **"Crear un proyecto"** → nombre: `datee-katherineee` (o el que prefieras).
3. Desactiva Google Analytics (opcional) → **Crear proyecto**.

### 2. Registrar la app web

1. En la página del proyecto, clic en el ícono **`</>`** (Web).
2. Apodo: `datee-web` → **Registrar app**.
3. Te mostrará un objeto `firebaseConfig` con estos valores. **Cópialos**.

### 3. Crear el archivo `.env`

Copia `.env.example` como `.env` y pega tus credenciales:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# La contraseña secreta para entrar a la app
VITE_APP_PASSWORD=katherine
```

### 4. Activar Firestore

1. Menú lateral → **Firestore Database** → **Crear base de datos**.
2. Ubicación: la más cercana → modo **iniciar en modo de prueba** (permite leer/escribir por 30 días; luego puedes ajustar reglas).
3. La colección `dates` se crea automáticamente al agregar el primer date.

### 5. Configurar Cloudinary (para las fotos)

Firebase Storage ya no está disponible en el plan gratuito para proyectos nuevos, así que las fotos se suben a **Cloudinary** (gratis, sin tarjeta, 25 GB):

1. Crea una cuenta gratis en [cloudinary.com](https://cloudinary.com).
2. Copia tu **Cloud name** (Dashboard de la consola).
3. Ve a **Settings → Upload → Upload presets → Add upload preset**:
   - **Signing mode:** `Unsigned`
   - Ponle un nombre, p.ej. `datee-fotos`
4. Pega ambos valores en el `.env`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=datee-fotos
   ```
5. Las fotos subidas aparecen en la **Media Library** de Cloudinary.

### 6. Correr la app

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173), mira florecer la rosa 🌹 y entra con tu contraseña.

## Reglas de seguridad recomendadas (producción)

Cuando quieras endurecer la seguridad, reemplaza las reglas de prueba:

**Firestore** (Firestore → Reglas):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /dates/{dateId} {
      allow read, write: if true; // app sin login; el acceso se protege en el frontend
    }
  }
}
```

> Las fotos en Cloudinary quedan protegidas por defecto con URLs únicas no adivinables (public ID autogenerado).

## Estructura

```
src/
├── config/firebase.ts        # Inicialización de Firebase
├── services/
│   ├── dates.ts              # Firestore: CRUD + onSnapshot en tiempo real
│   ├── storage.ts            # Cloudinary: subir fotos (upload unsigned)
│   └── auth.ts               # Contraseña simple (sessionStorage)
├── components/
│   ├── Gate.tsx              # Pantalla de palabra secreta
│   ├── DateForm.tsx          # Formulario para proponer dates
│   └── DateCard.tsx          # Tarjeta: elegir fecha, subir foto, eliminar
├── pages/
│   ├── WelcomeScreen.tsx     # Intro animada con GSAP (DrawSVG + MorphSVG)
│   ├── Planner.tsx           # Lista de dates en tiempo real
│   └── Gallery.tsx           # Grid de recuerdos con foto
└── types.ts                  # Modelo de datos
```

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Vercel detecta Vite automáticamente. En **Environment Variables** agrega todas las variables del `.env`.
4. Deploy 🚀
