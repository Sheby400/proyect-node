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
