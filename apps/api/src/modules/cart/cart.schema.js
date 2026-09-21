import { z } from 'zod'

const empty = z.object({}).default({})

export const getCartSchema = z.object({
    body: empty,
    params: empty,
    query: empty
})

export const addItemSchema = z.object ({
    body: z.object({
        productId: z.string().trim().min(1),
        quantity: z.coerce.number().int().positive().max(99)
    }),
    params: empty,
    query: empty
})

export const removeItemSchema = z.object ({
    body:empty,
    params: z.object({
        productId: z.string().trim().min(1)
    }),
    query: empty
})
