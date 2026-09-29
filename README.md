# Admin Chocolates SV

Panel administrativo (React + Vite + Tailwind CSS) para gestionar el catálogo de productos de Chocolates SV. Consume la API `ChocolatesSV.API` (ASP.NET Core).

## Requisitos

- Node.js 20 o superior
- API `ChocolatesSV.API` en ejecución (por defecto en `https://localhost:7076`)

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Define la URL de la API. El proyecto incluye `.env.development` con el valor por defecto; para otro entorno copia `.env.example` a `.env` (o `.env.production`) y ajusta:

   ```
   VITE_API_URL=https://localhost:7076/api
   ```

3. Inicia el panel:

   ```bash
   npm run dev
   ```

   Se abre en `http://localhost:5173`, el origen permitido por la política CORS de la API.

## Autenticación

El panel usa la autenticación por cookie de ASP.NET Core Identity:

- `POST /api/auth/login?useCookies=true` inicia sesión (con "Mantener la sesión iniciada" desmarcado usa `useSessionCookies=true`).
- `GET /api/auth/manage/info` restaura la sesión al recargar la página.
- `POST /api/auth/logout` cierra la sesión.

Todas las peticiones se envían con `withCredentials`. Si la API responde 401 fuera del flujo de login, el panel regresa a la pantalla de inicio de sesión.

Abre primero `https://localhost:7076` en el navegador y acepta el certificado de desarrollo; de lo contrario el navegador bloqueará las peticiones y la cookie.

## Endpoints consumidos

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/products` | Listado de productos activos |
| POST | `/api/admin/products` | Crear producto |
| PUT | `/api/admin/products/{id}` | Editar producto |
| DELETE | `/api/admin/products/{id}` | Eliminar producto (borrado lógico) |
| GET | `/api/categories` | Categorías del Select y filtros |

## Estructura

```
src/
  api/            cliente axios y manejo global de 401
  components/     layout y componentes de interfaz reutilizables
  context/        proveedores de autenticación y notificaciones
  hooks/          useAuth y useToast
  modules/
    auth/         pantalla de inicio de sesión
    products/     página, tabla y formulario de productos
  services/       llamadas a la API
  utils/          formato de moneda y errores de la API
```

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run lint`: revisión con ESLint
- `npm run preview`: vista previa del build
