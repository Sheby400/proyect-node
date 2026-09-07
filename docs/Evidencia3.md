# Evidencia 3 — Firebase, manejo de errores y módulo de productos

## 1. Dependencias

```json
{
  "dependencies": {
    "firebase-admin": "^14.3.0",
    "zod": "^4.4.3"
  }
}
```

## 2. Variables de entorno

```env
PORT=4000
API_PREFIX=/api
CORS_ORIGIN=*
LOG_LEVEL=info
FIREBASE_PROJECT_ID=monorepo-spm
```

## 3. Configuración de Firebase

```javascript
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { env } from './env.js'

const firebaseApp = getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: env.FIREBASE_PROJECT_ID
    })

export const db = getFirestore(firebaseApp)
```

## 4. Clase de error personalizada

```javascript
export class AppError extends Error {
    constructor({
        statusCode,
        code,
        message,
        details
    }) {
        super(message)
        this.name = 'AppError'
        this.statusCode = statusCode
        this.code = code
        this.details = details
    }
}
```

## 5. Middleware de validación

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
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError({
                    statusCode: 400,
                    code: 'VALIDATION_ERROR',
                    message: 'Request validation failed',
                    details: error.issues
                }))
            }

            return next(error)
        }
    }
}
```

## 6. Rutas del módulo de productos

```javascript
import { Router } from 'express'
import {
    createProductController,
    deleteProductController,
    getProductByIdController,
    getProducts,
    updateProductController
} from './product.controller.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { createProductSchema, productIdSchema } from './product.schema.js'

const router = Router()

router.get('/', asyncHandler(getProducts))
router.get('/:id', validate(productIdSchema), asyncHandler(getProductByIdController))
router.post('/', validate(createProductSchema), asyncHandler(createProductController))
router.put('/:id', validate(productIdSchema), validate(createProductSchema), asyncHandler(updateProductController))
router.delete('/:id', validate(productIdSchema), asyncHandler(deleteProductController))

export default router
```

## 7. Middleware centralizado de errores

```javascript
import { logger } from '../../config/logger.js'
import { env } from '../../config/env.js'
import { AppError } from '../errors/app-error.js'

export function errorMiddleware(err, req, res, _next) {
    if (err instanceof AppError) {
        logger.warn({
            code: err.code,
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            details: err.details
        }, err.message)

        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {})
            },
            meta: {
                requestId: req.id
            }
        })
    }

    logger.error({
        err,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl
    }, 'Unhandled application error')

    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
        },
        meta: {
            requestId: req.id
        }
    })
}
```
