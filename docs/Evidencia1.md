# Evidencia 1 Puga-Méndez 17/08/2026

## Creación del repositorio
La estructura principal del proyecto es:

```text
nodejs-monorepo
│
├── apps
│   ├── admin
│   │
│   ├── api
│   │
│   └── web
│
├── packages
│   ├── config
│   │
│   ├── contracts
│   │
│   └── shared
│
├── docs
│   └── Evidencia1.md
│
├── .gitignore
├── package.json
└── package-lock.json
```
# Código

## Códigos de terminal
``` BASH
npm init -y    
```

``` BASH
npm init -w apps/api -y    
``` 

``` BASH
npm init -w packages/contracts -y 
```

``` BASH
npm init -w packages/config -y 
```

``` BASH
npm init -w packages/shared -y
```

``` BASH
npm i express dotenv cors helmet pino pino-http --workspace=@ecommerce/api  
```

``` BASH
npm i -D nodemon eslint @eslint/js globals pino-pretty --workspace/api   
```
## Código en archivos

### env.js 
``` JS
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFile)
const envPath = path.resolve(currentDirectory, '../../.env')

dotenv.config({
    path: envPath
})

const port = Number(process.env.PORT ?? 4000)

if(!Number.isIntenger(port) || port < 1 || port > 65535){
    throw new Error('El puerto debe de ser válido')
}

export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV,
    PORT: port,
    API_PREFIX: process.env.API_PREFIX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    LOG_LEVEL:process.env.LOG_LEVEL 
})
```

### logger.js 
``` JS
import pino from "pino";
import { env } from "./env.js";

const transport = 
    env.NODE_ENV === 'production' ? undefined : pino.transport
    ({
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    })

    export const logger = pino({
        level: env.LOG_LEVEL
    }, transport)
```

### health.controller.js
``` JS
import { env } from "../../config/env.js";

export function getHealth(req, res){
    return res.status(200).json({
        success: true,
        data: {
            service: 'eccomerce-api',
            status: 'ok',
            environment: env.NODE_ENV,
            uptime: Number(process.uptime().toFixed(2)),
            timestamp: new Date().toISOString()
        },
        meta: {
            requestID: req.id
        }
    })
}
```

### health.routes.js
``` JS
import { Router } from 'express'
import { getHealth } from './health.controller.js'

const healthRoutes = Router()

healthRoutes.get('/', getHealth)

export default healthRoutes
```

### index.js
``` JS
import { Router } from 'express'
import { healthRoutes } from '../modules/health/health.routes.js'

const router = Router()

router.get('/', healthRoutes)

export default router
```

### error.middleware.js
``` JS
import { logger } from "../../config/logger.js";

export function errorMiddleware(err, req, res, _next){
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
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' :err.message
        },
        meta: {
            requestId: req.id
        }
    })
}
```

### not-found.middleware.js
``` JS
export function notFoundMiddleware (req, res){
    return res.status(404).json({
        success: false,
        error: {
            code:'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`
        },
        meta: {
            requestId: req.id
        }
    })
}
```