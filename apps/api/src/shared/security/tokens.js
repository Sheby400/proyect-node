import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { authConfig } from '../../config/auth.js'

export function signAccessToken (payload) {
    return jwt.sign(payload, authConfig.accessSecret, {
        expiresIn: authConfig.accessExpiresIn
    })
}

export function signRefreshToken (payload) {
    return jwt.sign(payload, authConfig.refreshSecret, {
        expiresIn: authConfig.refreshExpiresIn
    })
}

export function verifyAccessToken (token) {
    return jwt.verify(token, authConfig.accessSecret)
}

export function verifyRefreshToken (token) {
    return jwt.verify(token, authConfig.refreshSecret)
}

export function hashToken (token) {
    return createHash('sha256').update(token).digest('hex')
}
