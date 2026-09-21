# Evidencia 5 - Autenticación

## Trabajo realizado

Se comenzó con la autenticación del usuario. Se implementó el registro y la
validación de credenciales, además de la generación de tokens para mantener la
sesión del usuario.

## Validación de usuarios

Se utilizó Zod para validar los datos de registro y login.

```javascript
export const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().toLowerCase().email(),
        password: z.string().min(8).max(100)
    })
})
```

## Seguridad

Las contraseñas se guardan encriptadas con bcrypt y se generan tokens JWT para
acceso y refresh.

```javascript
export function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export function signAccessToken(payload) {
    return jwt.sign(payload, authConfig.accesSecret, {
        expiresIn: authConfig.accessExpiresIn
    })
}
```

## Persistencia en Firebase

Se guardan los usuarios en la colección `users` y los refresh tokens en la
colección `refreshTokens`.

```javascript
const usersCollection = db.collection('users')
const refreshTokensCollection = db.collection('refreshTokens')
```

## Resultado

La API ya tiene la base de autenticación con usuarios, contraseñas protegidas,
tokens JWT y almacenamiento en Firestore.
