# Módulo Products — Backend E-Commerce con Node.js

## Objetivo

Este documento contiene el código necesario para implementar el módulo `products` dentro del backend modular del proyecto E-Commerce.

El flujo de la petición será:

```text
HTTP Request
    |
    v
Router
    |
    v
Zod Validation
    |
    v
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Firebase Admin SDK
    |
    v
Firestore
```

---

# 1. Dependencias necesarias

Desde la raíz del monorepo:

```bash
npm install firebase-admin zod --workspace=@ecommerce/api
```

Estas dependencias tienen las siguientes responsabilidades:

| Paquete | Responsabilidad |
|---|---|
| `firebase-admin` | Conexión segura del backend con Firebase y Firestore |
| `zod` | Validación y transformación de parámetros, query strings y body |

---

# 2. Estructura esperada

```text
apps/api/src/
|
├── config/
│   └── firebase.js
│
├── modules/
│   └── products/
│       ├── product.controller.js
│       ├── product.repository.js
│       ├── product.routes.js
│       ├── product.schema.js
│       └── product.service.js
│
├── routes/
│   └── index.js
│
└── shared/
    ├── errors/
    │   └── app-error.js
    │
    ├── http/
    │   └── async-handler.js
    │
    └── middleware/
        ├── error.middleware.js
        └── validate.middleware.js
```

---

# 3. Configuración de Firebase

Archivo:

```text
apps/api/src/config/firebase.js
```

```javascript
import {
  cert,
  getApps,
  initializeApp
} from 'firebase-admin/app'

import {
  getFirestore
} from 'firebase-admin/firestore'

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = process.env

if (
  !FIREBASE_PROJECT_ID ||
  !FIREBASE_CLIENT_EMAIL ||
  !FIREBASE_PRIVATE_KEY
) {
  throw new Error(
    'Firebase environment variables are missing'
  )
}

const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      })

export const db = getFirestore(firebaseApp)
```

---

# 4. Variables de entorno

Agregar al archivo:

```text
apps/api/.env
```

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

No subir `.env` al repositorio.

En `.env.example` dejar únicamente placeholders:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

# 5. AppError

Archivo:

```text
apps/api/src/shared/errors/app-error.js
```

```javascript
export class AppError extends Error {
  constructor({
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    message = 'Internal server error',
    details = undefined
  }) {
    super(message)

    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}
```

---

# 6. asyncHandler

Archivo:

```text
apps/api/src/shared/http/async-handler.js
```

```javascript
export function asyncHandler(handler) {
  return function asyncRouteHandler(req, res, next) {
    Promise
      .resolve(handler(req, res, next))
      .catch(next)
  }
}
```

---

# 7. Middleware de validación

Archivo:

```text
apps/api/src/shared/middleware/validate.middleware.js
```

```javascript
import { ZodError } from 'zod'

import { AppError } from '../errors/app-error.js'

export function validate(schema) {
  return function validationMiddleware(req, _res, next) {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      })

      req.validated = result

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.issues
          })
        )
      }

      return next(error)
    }
  }
}
```

> Importante: usar `req.validated`, no `req.validate`.

---

# 8. Middleware global de errores

Archivo:

```text
apps/api/src/shared/middleware/error.middleware.js
```

```javascript
import { logger } from '../../config/logger.js'

export function errorMiddleware(err, req, res, _next) {
  const statusCode = err.statusCode ?? 500

  if (statusCode < 500) {
    logger.warn(
      {
        error: err,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl
      },
      'Request failed'
    )
  } else {
    logger.error(
      {
        error: err,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl
      },
      'Unhandled application error'
    )
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code ?? 'INTERNAL_SERVER_ERROR',
      message:
        statusCode >= 500
          ? 'Internal server error'
          : err.message,
      ...(err.details ? { details: err.details } : {})
    },
    meta: {
      requestId: req.id
    }
  })
}
```

> El método correcto de Pino es `logger.warn()`, no `logger.warm()`.

---

# 9. Schemas de Products

Archivo:

```text
apps/api/src/modules/products/product.schema.js
```

```javascript
import { z } from 'zod'

const emptyObject = z.object({}).default({})

const productIdParams = z.object({
  id: z.string().trim().min(1, 'Product id is required')
})

const skuSchema = z
  .string()
  .trim()
  .min(2, 'SKU must have at least 2 characters')
  .max(60, 'SKU is too long')
  .transform((value) => value.toUpperCase())

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Product name must have at least 2 characters')
  .max(150, 'Product name is too long')

const descriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description is too long')
  .default('')

const priceSchema = z.coerce
  .number()
  .nonnegative('Price cannot be negative')

const stockSchema = z.coerce
  .number()
  .int('Stock must be an integer')
  .nonnegative('Stock cannot be negative')

const activeSchema = z.boolean()

const createProductBody = z.object({
  sku: skuSchema,
  name: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  stock: stockSchema.default(0),
  active: activeSchema.default(true)
})

const updateProductBody = z
  .object({
    sku: skuSchema.optional(),
    name: nameSchema.optional(),
    description: z.string().trim().max(1000).optional(),
    price: priceSchema.optional(),
    stock: stockSchema.optional(),
    active: activeSchema.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
  })

const activeQuerySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === '') return undefined
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return value
  },
  z.boolean().optional()
)

export const listProductsSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20),
    active: activeQuerySchema
  })
})

export const getProductSchema = z.object({
  body: emptyObject,
  params: productIdParams,
  query: emptyObject
})

export const createProductSchema = z.object({
  body: createProductBody,
  params: emptyObject,
  query: emptyObject
})

export const updateProductSchema = z.object({
  body: updateProductBody,
  params: productIdParams,
  query: emptyObject
})

export const deleteProductSchema = z.object({
  body: emptyObject,
  params: productIdParams,
  query: emptyObject
})
```

---

# 10. Repository

Archivo:

```text
apps/api/src/modules/products/product.repository.js
```

```javascript
import { FieldValue } from 'firebase-admin/firestore'

import { db } from '../../config/firebase.js'

const productsCollection = db.collection('products')

function mapTimestamp(value) {
  return value?.toDate?.()?.toISOString() ?? null
}

function mapProduct(document) {
  if (!document.exists) {
    return null
  }

  const data = document.data()

  return {
    id: document.id,
    ...data,
    createdAt: mapTimestamp(data.createdAt),
    updatedAt: mapTimestamp(data.updatedAt)
  }
}

export async function listProducts({ limit, active }) {
  let query = productsCollection
    .orderBy('createdAt', 'desc')
    .limit(limit)

  if (active !== undefined) {
    query = productsCollection
      .where('active', '==', active)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(mapProduct)
}

export async function findProductById(id) {
  const document = await productsCollection.doc(id).get()
  return mapProduct(document)
}

export async function findProductBySku(sku) {
  const snapshot = await productsCollection
    .where('sku', '==', sku)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return mapProduct(snapshot.docs[0])
}

export async function createProduct(data) {
  const productRef = productsCollection.doc()

  await productRef.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  const created = await productRef.get()
  return mapProduct(created)
}

export async function updateProduct(id, data) {
  const productRef = productsCollection.doc(id)

  await productRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  })

  const updated = await productRef.get()
  return mapProduct(updated)
}

export async function deleteProduct(id) {
  await productsCollection.doc(id).delete()
}
```

> El método correcto es `toISOString()`, no `toIOSString()`.

---

# 11. Service

Archivo:

```text
apps/api/src/modules/products/product.service.js
```

```javascript
import { AppError } from '../../shared/errors/app-error.js'
import * as productRepository from './product.repository.js'

export async function listProducts(filters) {
  return productRepository.listProducts(filters)
}

export async function getProduct(id) {
  const product = await productRepository.findProductById(id)

  if (!product) {
    throw new AppError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado'
    })
  }

  return product
}

export async function createProduct(data) {
  const existingProduct = await productRepository.findProductBySku(
    data.sku
  )

  if (existingProduct) {
    throw new AppError({
      statusCode: 409,
      code: 'PRODUCT_SKU_EXISTS',
      message: 'Ya existe un producto con ese SKU'
    })
  }

  return productRepository.createProduct(data)
}

export async function updateProduct(id, changes) {
  const currentProduct = await getProduct(id)

  if (changes.sku && changes.sku !== currentProduct.sku) {
    const existingProduct = await productRepository.findProductBySku(
      changes.sku
    )

    if (existingProduct) {
      throw new AppError({
        statusCode: 409,
        code: 'PRODUCT_SKU_EXISTS',
        message: 'Ya existe un producto con ese SKU'
      })
    }
  }

  return productRepository.updateProduct(id, changes)
}

export async function deleteProduct(id) {
  await getProduct(id)
  await productRepository.deleteProduct(id)
}
```

---

# 12. Controller

Archivo:

```text
apps/api/src/modules/products/product.controller.js
```

```javascript
import * as productService from './product.service.js'

export async function listProducts(req, res) {
  const products = await productService.listProducts(
    req.validated.query
  )

  return res.status(200).json({
    success: true,
    data: products,
    meta: {
      count: products.length,
      requestId: req.id
    }
  })
}

export async function getProduct(req, res) {
  const product = await productService.getProduct(
    req.validated.params.id
  )

  return res.status(200).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function createProduct(req, res) {
  const product = await productService.createProduct(
    req.validated.body
  )

  return res.status(201).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function updateProduct(req, res) {
  const product = await productService.updateProduct(
    req.validated.params.id,
    req.validated.body
  )

  return res.status(200).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function deleteProduct(req, res) {
  await productService.deleteProduct(
    req.validated.params.id
  )

  return res.status(204).send()
}
```

---

# 13. Routes de Products

Archivo:

```text
apps/api/src/modules/products/product.routes.js
```

```javascript
import { Router } from 'express'

import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from './product.controller.js'

import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  listProductsSchema,
  updateProductSchema
} from './product.schema.js'

import { asyncHandler } from '../../shared/http/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'

const router = Router()

router.get(
  '/',
  validate(listProductsSchema),
  asyncHandler(listProducts)
)

router.get(
  '/:id',
  validate(getProductSchema),
  asyncHandler(getProduct)
)

router.post(
  '/',
  validate(createProductSchema),
  asyncHandler(createProduct)
)

router.patch(
  '/:id',
  validate(updateProductSchema),
  asyncHandler(updateProduct)
)

router.delete(
  '/:id',
  validate(deleteProductSchema),
  asyncHandler(deleteProduct)
)

export default router
```

---

# 14. Registrar Products en el Router principal

Archivo:

```text
apps/api/src/routes/index.js
```

```javascript
import { Router } from 'express'

import healthRoutes from './../modules/health/health.routes.js'
import productRoutes from './../modules/products/product.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/products', productRoutes)

export default router
```

Los endpoints serán:

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

---

# 15. Verificar app.js

El router principal debe montarse una sola vez.

```javascript
import apiRouter from './routes/index.js'

app.use(
  env.API_PREFIX,
  apiRouter
)
```

Con:

```env
API_PREFIX=/api/v1
```

---

# 16. Pruebas con curl

## Listar

```bash
curl -i http://localhost:4050/api/v1/products
```

## Listar con filtros

```bash
curl -i "http://localhost:4050/api/v1/products?limit=5&active=true"
```

## Crear

```bash
curl -i \
  -X POST \
  http://localhost:4050/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAP-001",
    "name": "Laptop",
    "description": "Laptop de prueba",
    "price": 15000,
    "stock": 10,
    "active": true
  }'
```

## Obtener por ID

```bash
curl -i http://localhost:4050/api/v1/products/PRODUCT_ID
```

## Actualizar

```bash
curl -i \
  -X PATCH \
  http://localhost:4050/api/v1/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 14000,
    "stock": 7
  }'
```

## Eliminar

```bash
curl -i \
  -X DELETE \
  http://localhost:4050/api/v1/products/PRODUCT_ID
```

---

# 17. Respuestas esperadas

| Caso | Status |
|---|---:|
| Listar productos | `200 OK` |
| Obtener producto | `200 OK` |
| Crear producto | `201 Created` |
| Actualizar producto | `200 OK` |
| Eliminar producto | `204 No Content` |
| Datos inválidos | `400 Bad Request` |
| Producto inexistente | `404 Not Found` |
| SKU duplicado | `409 Conflict` |

---

# 18. Errores importantes corregidos

## `req.validate` vs `req.validated`

Incorrecto:

```javascript
req.validate.query
```

Correcto:

```javascript
req.validated.query
```

## ZodError sin next

Incorrecto:

```javascript
new AppError(...)
```

Correcto:

```javascript
return next(new AppError(...))
```

## Pino

Incorrecto:

```javascript
logger.warm()
```

Correcto:

```javascript
logger.warn()
```

## ISO Date

Incorrecto:

```javascript
toIOSString()
```

Correcto:

```javascript
toISOString()
```

## Obtener ID

Incorrecto:

```javascript
req.validated.body
```

Correcto:

```javascript
req.validated.params.id
```

## Montar un Router

Incorrecto:

```javascript
router.get('/products', productRoutes)
```

Correcto:

```javascript
router.use('/products', productRoutes)
```

---

# 19. Flujo final

```text
GET /api/v1/products
        |
        v
product.routes.js
        |
        v
validate(listProductsSchema)
        |
        v
req.validated.query
        |
        v
product.controller.js
        |
        v
product.service.js
        |
        v
product.repository.js
        |
        v
Firestore
        |
        v
HTTP 200
```

---

# 20. Validación final

```bash
npm run lint
```

Después:

```bash
npm run dev
```

En otra terminal:

```bash
curl -i http://localhost:4050/api/v1/products
```

La petición debe responder con un status HTTP y no quedar abierta como `request aborted`.

---

# 21. Git

```bash
git switch develop
git switch -c feature/products
```

Después:

```bash
git add .
git commit -m "feat(products): add product CRUD with Firestore"
```

Merge:

```bash
git switch develop
git merge feature/products
```

---

# 22. Checklist

- [ ] `firebase-admin` instalado.
- [ ] `zod` instalado.
- [ ] Firebase configurado.
- [ ] `AppError` creado.
- [ ] `asyncHandler` creado.
- [ ] `validate.middleware.js` corregido.
- [ ] `error.middleware.js` usa `logger.warn()`.
- [ ] `product.schema.js` creado.
- [ ] `product.repository.js` creado.
- [ ] `product.service.js` creado.
- [ ] `product.controller.js` creado.
- [ ] `product.routes.js` creado.
- [ ] `/products` registrado con `router.use()`.
- [ ] `GET /products` funciona.
- [ ] `GET /products/:id` funciona.
- [ ] `POST /products` responde `201`.
- [ ] `PATCH /products/:id` funciona.
- [ ] `DELETE /products/:id` responde `204`.
- [ ] Validación incorrecta responde `400`.
- [ ] Producto inexistente responde `404`.
- [ ] SKU duplicado responde `409`.
- [ ] No existen peticiones `request aborted` por validación.
- [ ] `npm run lint` pasa correctamente.

---

# Arquitectura resultante

```text
Node.js
   |
   v
Express
   |
   v
/api/v1
   |
   +-- /health
   |
   `-- /products
          |
          v
        Zod
          |
          v
      Controller
          |
          v
       Service
          |
          v
      Repository
          |
          v
      Firestore
```

El módulo `Products` queda preparado para agregar posteriormente autenticación, roles y permisos sin modificar su arquitectura interna.
