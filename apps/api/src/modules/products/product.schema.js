import { z } from 'zod'

const emptyObject = z.object({}).default({})

const productIdParams = z.object({
  id: z.string().trim().min(1, 'Product id is required')
})

const skuSchema = z
  .string()
  .trim()
  .min(2, 'SKU must have at least 2 characters')
  .max(60, 'SKU is too long')
  .transform((value) => value.toUpperCase())

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Product name must have at least 2 characters')
  .max(150, 'Product name is too long')

const descriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Description is too long')
  .default('')

const priceSchema = z.coerce
  .number()
  .nonnegative('Price cannot be negative')

const stockSchema = z.coerce
  .number()
  .int('Stock must be an integer')
  .nonnegative('Stock cannot be negative')

const activeSchema = z.boolean()

const createProductBody = z.object({
  sku: skuSchema,
  name: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  stock: stockSchema.default(0),
  active: activeSchema.default(true),
  categoryId: z.string().trim().min(1)
})

const updateProductBody = z
  .object({
    sku: skuSchema.optional(),
    name: nameSchema.optional(),
    description: z.string().trim().max(1000).optional(),
    price: priceSchema.optional(),
    stock: stockSchema.optional(),
    active: activeSchema.optional(),
    categoryId: z.string().trim().min(1)
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
  })

const activeQuerySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === '') return undefined
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return value
  },
  z.boolean().optional()
)

export const listProductsSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20),
    active: activeQuerySchema
  })
})

export const getProductSchema = z.object({
  body: emptyObject,
  params: productIdParams,
  query: emptyObject
})

export const createProductSchema = z.object({
  body: createProductBody,
  params: emptyObject,
  query: emptyObject
})

export const updateProductSchema = z.object({
  body: updateProductBody,
  params: productIdParams,
  query: emptyObject
})

export const deleteProductSchema = z.object({
  body: emptyObject,
  params: productIdParams,
  query: emptyObject
})
