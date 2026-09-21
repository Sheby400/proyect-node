import { AppError } from "../../shared/errors/app-error.js";
import{ hashPassword, verifyPassword } from '../../shared/security/password.js'
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/security/tokens.js'
import * as userRepository from '../users/user.repository.js'
import * as authRepository from '../auth/auth.repository.js'

function issueTokens (user) {
    const payload ={
        sub: user.id,
        role: user.role
    }
    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload)
    }
}

export async function register (data){
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
    return{
        user,
        ...tokens
    }
}

export async function login (data) {
    const user = await userRepository.findByEmail(data.email)

    if (!user) {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales Inválidas'
        })
    }

    const validPassword = await verifyPassword(data.password, user.passwordHash)

    if (!validPassword || !user.active) {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales Inválidas'
        })
    }

    const tokens = issueTokens(user)


    await authRepository.saveRefreshToken({
        userId: user.id,
        tokenHash: hashToken(tokens.refreshToken)
    })

    return {
        user,
        ...tokens
    }
}

export async function refresh (refreshToken) {
    let payload
    try {
        payload = verifyRefreshToken(refreshToken)
    } catch {
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token inválido'
        })
    }
    const tokenHash = hashToken(refreshToken)
    const storedToken = await authRepository.findRefreshToken(tokenHash)
    if (!storedToken || storedToken.revoked || storedToken.userId !== payload.sub){
        throw new AppError({
            statusCode: 401,
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Refresh token inválido'
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
