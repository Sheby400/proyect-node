import { z } from 'zod'

const empty = z.object({}).default({})

const params = z.object({
    id: z.string().trim().min(1)
})

const categoryBody = z.object({
    name: z.string().trim().min(2).max(100),
    slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+$/),
    active: z.boolean().default(true)
})

export const listCategoriesSchema = z.object({
    body: empty,
    params: empty,
    query: empty
})

export const getCategorySchema = z.object({
    body: empty,
    params: empty,
    query: empty
})

export const createCategorySchema = z.object({
    body: categoryBody,
    params: empty,
    query: empty
})

export const updateCategorySchema = z.object({
    body: categoryBody.partial().refine(value =>
        Object.keys(value).legth > 0 , {
        message: 'Es requerido mínimo un campo'
    }),
    params,
    query: empty
})

export const deleteCategorySchema = z.object({
    body: empty,
    params,
    query: empty
})
