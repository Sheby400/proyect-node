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

if(!Number.isInteger(port) || port < 1 || port > 65535){
    throw new Error('El puerto debe de ser válido')
}

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
    throw new Error('Faltan las variables de entorno de Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)')
}

export const env = Object.freeze({
    NODE_ENV: process.env.NODE_ENV,
    PORT: port,
    API_PREFIX: process.env.API_PREFIX,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    LOG_LEVEL: process.env.LOG_LEVEL,
    FIREBASE_PROJECT_ID: firebaseProjectId,
    FIREBASE_CLIENT_EMAIL: firebaseClientEmail,
    FIREBASE_PRIVATE_KEY: firebasePrivateKey,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN:process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN:process.env.JWT_REFRESH_EXPIRES_IN

})
