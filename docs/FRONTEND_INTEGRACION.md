# Integración Frontend + Backend

## Contrato usado

El frontend consume las rutas definidas en las sesiones:

| Módulo | Método | Ruta |
| --- | --- | --- |
| Auth | POST | `/api/v1/auth/register` |
| Auth | POST | `/api/v1/auth/login` |
| Auth | POST | `/api/v1/auth/refresh` |
| Users | GET | `/api/v1/users/me` |
| Products | GET | `/api/v1/products` |
| Products | GET | `/api/v1/products/:id` |
| Products | POST | `/api/v1/products` |
| Products | PATCH | `/api/v1/products/:id` |
| Products | DELETE | `/api/v1/products/:id` |
| Categories | GET | `/api/v1/categories` |
| Categories | POST | `/api/v1/categories` |
| Categories | PATCH | `/api/v1/categories/:id` |
| Categories | DELETE | `/api/v1/categories/:id` |
| Cart | GET | `/api/v1/cart` |
| Cart | POST | `/api/v1/cart/items` |
| Cart | DELETE | `/api/v1/cart/items/:productId` |
| Orders | POST | `/api/v1/orders` |
| Orders | GET | `/api/v1/orders` |
| Orders | GET | `/api/v1/orders/:id` |

## Variables de entorno

Crear `apps/web/.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:4050/api/v1
```

## Flujo de uso

1. Levantar backend en `http://localhost:4050`.
2. Levantar frontend con `npm run dev:web`.
3. Registrar usuario desde `/register`.
4. Iniciar sesión desde `/login`.
5. Agregar productos al carrito desde `/`.
6. Confirmar compra desde `/cart`.
7. Consultar órdenes desde `/orders`.

## Roles

| Rol | Uso en frontend |
| --- | --- |
| `CUSTOMER` | Puede comprar, ver carrito y consultar sus órdenes. |
| `ADMIN` | Puede administrar productos y categorías. |
| `SUPER_ADMIN` | Tiene acceso administrativo completo. |

El backend sigue siendo la fuente de autorización. El frontend solo oculta o muestra pantallas según el rol para mejorar la experiencia.
