# Evidencia 2 Puga-Méndez 26/08/2026

## Configuración e inicio del servidor

```text
server.js
    │
    ▼
app.js
    │
    ├── Seguridad HTTP
    ├── CORS
    ├── Registro de solicitudes
    ├── Lectura del cuerpo de la petición
    ├── Rutas
    └── Manejo de errores
```

`app.js` crea y configura la aplicación de Express. `server.js` utiliza esa
aplicación para abrir el puerto HTTP y cerrar el proceso de forma segura ante
las señales del sistema operativo.

# Código

## app.js

Archivo:

```text
apps/api/src/app.js
```

Este archivo concentra los middlewares globales de la API. Primero desactiva
el encabezado que revela que se utiliza Express. Después genera o conserva un
identificador para cada solicitud, registra la petición mediante Pino y agrega
el mismo identificador en la respuesta HTTP.

Posteriormente aplica Helmet, CORS, los analizadores para cuerpos JSON y
formularios, registra las rutas con el prefijo configurado y, al final, añade
los middlewares de ruta no encontrada y de error. El orden es importante:
una ruta inexistente se atiende después de intentar resolver las rutas de la
API, y los errores se procesan al final.

```js
import { randomUUID } from 'node:crypto';
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { env } from './config/env.js'
import { logger } from './config/logger.js'
import router from './routes/index.js';
import { errorMiddleware } from './shared/middleware/error.middleware.js'
import { notFoundMiddleware } from './shared/middleware/not-found.middleware.js'

export const app = express()
app.disable('x-powered-by')

app.use(pinoHttp({
    logger,
    genReqId(req, res){
        const existingRequestId = req.headers['x-powered-id']
        const requestId = typeof existingRequestId === 'string' ? existingRequestId : randomUUID()

        res.setHeader('x-request-id', requestId)
        return requestId
    }
}))

app.use(helmet())
app.use(cors({
    origin: env.CORS_ORIGIN
}))
app.use(express.json({
    limit: '1mb'
}))
app.use(express.urlencoded({
    extended: false,
    limit: '1mb'
}))
app.use(env.API_PREFIX, router)
app.use(notFoundMiddleware)
app.use(errorMiddleware)
```

### Flujo de una solicitud

```text
Solicitud HTTP
    │
    ▼
Request ID y logger
    │
    ▼
Helmet y CORS
    │
    ▼
JSON / URL encoded
    │
    ▼
Rutas de la API
    │
    ├── Ruta encontrada → respuesta del controlador
    └── Ruta no encontrada → respuesta 404
                              │
                              ▼
                       Error inesperado → respuesta 500
```

El límite de `1mb` evita procesar cuerpos de solicitud demasiado grandes. La
configuración de CORS se obtiene de `env.CORS_ORIGIN`, por lo que el origen
permitido no queda escrito directamente en el código. `randomUUID()` es un
módulo nativo de Node.js y permite asignar un identificador único a cada
solicitud que no incluya uno existente.

## server.js

Archivo:

```text
apps/api/src/server.js
```

Este archivo inicia el servidor HTTP usando el puerto definido en las variables
de entorno. También implementa un apagado controlado: cuando el proceso recibe
`SIGINT` o `SIGTERM`, deja de aceptar conexiones, registra el resultado y
finaliza el proceso. La variable `shuttingDown` evita ejecutar ese procedimiento
más de una vez.

```js
import { app } from "./app.js"
import { env } from "./config/env.js"
import { logger } from "./config/logger.js"

const server = app.listen(env.PORT, () => {
    logger.info({
        port: env.PORT,
        environment: env.NODE_ENV
    }, `Proyecto NodeJS running 🚀: ${env.PORT}`)
})

let shuttingDown = false

function shutdown(signal) {
    if(shuttingDown) {
        return
    }
    shuttingDown = true
    logger.info({
        signal
    }, 'Inicia proceso de apagado')

    server.close((error) => {
        if (error) {
            logger.error({
                err:error
            }, 'Errir cyabdi se aoagaba el servidor')
            process.exit(1)
        }
        logger.info('Servidor HTTP cerrado')
        process.exit(0)
    })

    setTimeout(() => {
        logger.error('Forzado a apagar después de cierto tiempo')
        process.exit(1)
    }, 10000).unref()
}

process.on('SIGINT', () => {
    shutdown('SIGINT')
})
process.on('SIGTERM', () => {
    shutdown('SIGTERM')
})
```

### Apagado controlado

```text
SIGINT o SIGTERM
      │
      ▼
shutdown(signal)
      │
      ├── Si ya se está apagando, termina la función
      │
      ▼
server.close()
      │
      ├── Cierre correcto → código de salida 0
      └── Error o tiempo máximo de 10 segundos → código de salida 1
```

El temporizador se desconecta con `unref()` para que no mantenga el proceso
activo por sí mismo. Solo actúa como respaldo si el servidor no logra terminar
en diez segundos.

## Ejecución

Desde la raíz del monorepo se puede iniciar el backend con:

```bash
npm run dev
```

El comando ejecuta el script de desarrollo del workspace `@ecommerce/api`, el
cual inicia `src/server.js`. Durante el arranque, el logger muestra el puerto y
el entorno configurado. Las solicitudes posteriores pasan por la cadena de
middlewares definida en `app.js`.

## Resultado

Con estos archivos, la aplicación Express queda separada de la responsabilidad
de abrir y cerrar el servidor HTTP. Esto permite reutilizar `app` en pruebas
posteriores sin iniciar un puerto y mantiene centralizadas la seguridad, el
registro de solicitudes y la preparación de las respuestas de la API.
