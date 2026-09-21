# Evidencia 6 - Autenticacion y proteccion de usuarios

## Trabajo realizado el 10 de septiembre de 2026

Se amplio la autenticacion del backend para permitir el registro de usuarios,
el inicio de sesion y la renovacion de tokens. Tambien se agrego un endpoint
protegido para consultar el usuario autenticado.

La implementacion utiliza:

- `bcryptjs` para proteger las contrasenas.
- `jsonwebtoken` para generar y validar tokens JWT.
- `crypto` para guardar el hash SHA-256 de los refresh tokens.
- Zod para validar las solicitudes.
- Firebase Admin y Firestore para persistir usuarios y sesiones.
- Middleware para proteger rutas mediante `Authorization: Bearer <token>`.

## Flujo de autenticacion

```text
Registro o login
       |
       v
Validacion con Zod
       |
       v
Servicio de autenticacion
       |
       +--> Hash de contrasena con bcryptjs
       +--> Creacion o verificacion del usuario
       +--> Generacion de access token y refresh token
       +--> Hash del refresh token en Firestore
       |
       v
Respuesta JSON
```

Para consultar el perfil, el cliente envia el access token. El middleware lo
verifica y coloca la identidad del usuario en `req.auth` antes de ejecutar el
controlador.

## Dependencia agregada

En `apps/api/package.json` se agrego `bcryptjs`:

```json
{
    "dependencies": {
        "bcryptjs": "^3.0.3"
    }
}
```

## Variables de entorno

Se agregaron las variables JWT a `apps/api/.env`. Las claves reales no deben
publicarse en la evidencia ni subirse al repositorio.

```env
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

`apps/api/src/config/env.js` centraliza estas variables junto con la
configuracion existente de Firebase:

```javascript
export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV,
    PORT: port,
    API_PREFIX: process.env.API_PREFIX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    LOG_LEVEL: process.env.LOG_LEVEL,
    FIREBASE_PROJECT_ID: firebaseProjectId,
    FIREBASE_CLIENT_EMAIL: firebaseClientEmail,
    FIREBASE_PRIVATE_KEY: firebasePrivateKey,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN
})
```

## Configuracion de autenticacion

Archivo: `apps/api/src/config/auth.js`

```javascript
import { env } from './env.js'

if (!env.JWT_ACCESS_SECRET) {
    throw new Error('JWT ACCESS SECRET es requerido')
}

if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT REFRESH SECRET es requerido')
}

export const authConfig = Object.freeze({
    accesSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN
})
```

La configuracion valida que existan los secretos antes de iniciar la
aplicacion. Los tiempos de expiracion se obtienen del entorno.

## Seguridad de contrasenas

Archivo: `apps/api/src/shared/security/password.js`

```javascript
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export function verifyPassword(password, hashPassword) {
    return bcrypt.compare(password, hashPassword)
}
```

La contrasena original no se almacena. Durante el registro se guarda un hash y
durante el login se compara la contrasena recibida con ese hash.

## Tokens JWT

Archivo: `apps/api/src/shared/security/tokens.js`

```javascript
import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { authConfig } from '../../config/auth.js'

export function signAccessToken(payload) {
    return jwt.sign(payload, authConfig.accesSecret, {
        expiresIn: authConfig.accessExpiresIn
    })
}

export function signRefreshToken(payload) {
    return jwt.sign(payload, authConfig.refreshSecret, {
        expiresIn: authConfig.refreshExpiresIn
    })
}

export function verifyAccessToken(token) {
    return jwt.verify(token, authConfig.accessSecret)
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, authConfig.refreshSecret)
}

export function hashToken(token) {
    return createHash('sha256').update(token).digest('hex')
}
```

El access token identifica al usuario en las solicitudes protegidas. El
refresh token permite solicitar una nueva pareja de tokens sin volver a enviar
la contrasena.

## Validacion de solicitudes

Archivo: `apps/api/src/modules/auth/auth.schema.js`

```javascript
import { z } from 'zod'

const empty = z.object({}).default({})
const email = z.string().trim().toLowerCase().email()
const password = z.string().min(8).max(100)

export const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(120),
        email,
        password
    }),
    params: empty,
    query: empty
})

export const loginSchema = z.object({
    body: z.object({
        email,
        password
    }),
    paramas: empty,
    query: empty
})

export const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1)
    }),
    params: empty,
    query: empty
})
```

El correo se limpia y se convierte a minusculas. La contrasena debe tener entre
8 y 100 caracteres. Cada esquema valida el cuerpo, los parametros y la query
antes de llegar al controlador.

## Persistencia de usuarios

Archivo: `apps/api/src/modules/users/user.repository.js`

```javascript
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../../config/firebase.js'

const usersCollection = db.collection('users')

function mapTimeStamp(value) {
    return value?.toDate?.()?.toISOString() ?? null
}

function mapUser(document) {
    if (!document.exists) {
        return null
    }

    const data = document.data()
    return {
        id: document.id,
        email: data.email,
        name: data.name,
        role: data.role,
        active: data.active,
        createdAt: mapTimeStamp(data.createdAt),
        updatedAt: mapTimeStamp(data.updatedAt)
    }
}

export async function createUser(data) {
    const user = usersCollection.doc()
    await user.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    })

    const created = await user.get()
    return mapUser(created)
}

export async function findById(id) {
    const doc = await usersCollection.doc(id).get()
    return mapUser(doc)
}

export async function findByEmail(email) {
    const users = await usersCollection.where('email', '==', email)
        .limit(1)
        .get()

    if (users.empty) {
        return null
    }

    const foundUser = users.docs[0]
    return {
        ...mapUser(foundUser),
        passwordHash: foundUser.data().passwordHash
    }
}
```

El mapper evita devolver `passwordHash` en las respuestas publicas. El hash se
recupera unicamente dentro de `findByEmail`, donde se necesita para verificar
el login.

## Persistencia de refresh tokens

Archivo: `apps/api/src/modules/auth/auth.repository.js`

```javascript
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../../config/firebase.js'

const refreshTokensCollection = db.collection('refreshTokens')

export async function saveRefreshToken({ userId, tokenHash }) {
    await refreshTokensCollection.doc(tokenHash).set({
        userId,
        revoked: false,
        createdAt: FieldValue.serverTimestamp()
    })
}

export async function findRefreshToken(tokenHash) {
    const token = await refreshTokensCollection.doc(tokenHash).get()
    if (!token.exists) {
        return null
    }

    return {
        id: token.id,
        ...token.data()
    }
}

export async function revokeRefreshToken(tokenHash) {
    await refreshTokensCollection.doc(tokenHash).set({
        revoked: true,
        revokedAt: FieldValue.serverTimestamp()
    }, { merge: true })
}
```

En Firestore se almacena el hash del refresh token, no el token original. Al
renovarlo, el token anterior se marca como revocado.

## Servicio de autenticacion

Archivo: `apps/api/src/modules/auth/auth.service.js`

```javascript
import { AppError } from '../../shared/errors/app-error.js'
import { hashPassword, verifyPassword } from '../../shared/security/password.js'
import {
    hashToken,
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from '../../shared/security/tokens.js'
import * as userRepository from '../users/user.repository.js'
import * as authRepository from './auth.repository.js'

function issueTokens(user) {
    const payload = {
        sub: user.id,
        role: user.role
    }

    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload)
    }
}

export async function register(data) {
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
        throw new AppError({
            statusCode: 409,
            code: 'EMAIL_EXISTS',
            message: 'El correo ya fue registrado'
        })
    }

    const user = await userRepository.createUser({
        name: data.name,
        email: data.email,
        passwordHash: await hashPassword(data.password),
        role: 'CUSTOMER',
        active: true
    })

    const tokens = issueTokens(user)
    await authRepository.saveRefreshToken({
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken)
    })

    return { user, ...tokens }
}

export async function login(data) {
    const user = await userRepository.findByEmail(data.email)
    if (!user) {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales invalidas'
        })
    }

    const validPassword = await verifyPassword(data.password, user.passwordHash)
    if (!validPassword || !user.active) {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales invalidas'
        })
    }

    const tokens = issueTokens(user)
    await authRepository.saveRefreshToken({
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken)
    })

    return { user, ...tokens }
}

export async function refresh(refreshToken) {
    let payload
    try {
        payload = verifyRefreshToken(refreshToken)
    } catch {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token invalido'
        })
    }

    const tokenHash = hashToken(refreshToken)
    const storedToken = await authRepository.findRefreshToken(tokenHash)
    if (!storedToken || storedToken.revoked || storedToken.userId !== payload.sub) {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token invalido'
        })
    }

    await authRepository.revokeRefreshToken(tokenHash)
    const user = await userRepository.findById(payload.sub)
    if (!user || !user.active) {
        throw new AppError({
            statusCode: 401,
            code: 'USER_DISABLED',
            message: 'Usuario no disponible'
        })
    }

    const tokens = issueTokens(user)
    await authRepository.saveRefreshToken({
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken)
    })

    return tokens
}
```

El servicio impide registrar correos repetidos, valida las credenciales,
rechaza usuarios inactivos y rota los refresh tokens durante la renovacion.

## Controladores y rutas de autenticacion

Archivo: `apps/api/src/modules/auth/auth.controller.js`

```javascript
import * as authService from './auth.service.js'

export async function register(req, res) {
    const data = await authService.register(req.validated.body)
    return res.status(201).json({ success: true, data, meta: { requestId: req.id } })
}

export async function login(req, res) {
    const data = await authService.login(req.validated.body)
    return res.status(200).json({ success: true, data, meta: { requestId: req.id } })
}

export async function refresh(req, res) {
    const data = await authService.refresh(req.validated.body.refreshToken)
    return res.status(200).json({ success: true, data, meta: { requestId: req.id } })
}
```

Archivo: `apps/api/src/modules/auth/auth.routes.js`

```javascript
import { Router } from 'express'
import { login, refresh, register } from './auth.controller.js'
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'

const router = Router()

router.post('/register', validate(registerSchema), asyncHandler(register))
router.post('/login', validate(loginSchema), asyncHandler(login))
router.post('/refresh', validate(refreshSchema), asyncHandler(refresh))

export default router
```

Endpoints agregados:

| Metodo | Ruta | Funcion |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registrar un usuario |
| `POST` | `/api/v1/auth/login` | Iniciar sesion |
| `POST` | `/api/v1/auth/refresh` | Renovar tokens |

## Middleware de autenticacion

Archivo: `apps/api/src/shared/middleware/authenticate.middleware.js`

```javascript
import { AppError } from '../errors/app-error.js'
import { verifyAccessToken } from '../security/tokens.js'

export function authenticate(req, _res, next) {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new AppError({
            statusCode: 401,
            code: 'AUTH_REQUIRED',
            message: 'Autenticacion requerida'
        })
    }

    const token = authorization.slice(7)
    try {
        const payload = verifyAccessToken(token)
        req.auth = {
            userId: payload.sub,
            role: payload.role
        }
        return next()
    } catch {
        return next(new AppError({
            statusCode: 401,
            code: 'INVALID_ACCESS_TOKEN',
            message: 'Access token invalido'
        }))
    }
}
```

El middleware rechaza solicitudes sin encabezado Bearer o con un token no
valido. Cuando el token es correcto, conserva el identificador y el rol en
`req.auth`.

## Endpoint del usuario autenticado

Archivo: `apps/api/src/modules/users/user.controller.js`

```javascript
import { AppError } from '../../shared/errors/app-error.js'
import * as userRepository from './user.repository.js'

export async function me(req, res) {
    const user = await userRepository.findById(req.auth.userId)
    if (!user) {
        throw new AppError({
            statusCode: 404,
            code: 'USER_NOT_FOUND',
            message: 'Usuario no encontrado'
        })
    }

    return res.status(200).json({
        success: true,
        data: user,
        meta: { requestId: req.id }
    })
}
```

Archivo: `apps/api/src/modules/users/user.routes.js`

```javascript
import { Router } from 'express'
import { me } from './user.controller.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'

const router = Router()
router.get('/me', authenticate, asyncHandler(me))

export default router
```

Endpoint agregado:

```text
GET /api/v1/users/me
Authorization: Bearer <access-token>
```

## Integracion de rutas y Firebase

Archivo: `apps/api/src/routes/index.js`

```javascript
import authRoutes from './../modules/auth/auth.routes.js'
import userRoutes from './../modules/users/user.routes.js'

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
```

Tambien se actualizo `firebase.js` para leer las credenciales desde el objeto
centralizado `env`:

```javascript
import { env } from './env.js'

const firebaseApp = getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    })
```

El modulo de productos tambien fue actualizado para importar
`async-handler.js` desde `shared/middleware`, que es la ubicacion comun usada
por autenticacion y productos.

## Resultado

La API cuenta con registro, login, renovacion de tokens y consulta del usuario
autenticado. Las contrasenas y los refresh tokens se almacenan de forma
protegida, las solicitudes se validan antes de llegar a los servicios y las
rutas privadas requieren un access token JWT valido.
