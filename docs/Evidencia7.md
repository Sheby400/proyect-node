# Evidencia 7 — CRUD de Productos
## 📁 `apps/api/src/modules/products/product.repository.js`

```javascript
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../../config/firebase.js'

const productsCollection = db.collection('products')

function mapTimestamp(value) {
  return value?.toDate?.()?.toISOString() ?? null
}

function mapProduct(document) {
  if (!document.exists) {
    return null
  }

  const data = document.data()

  return {
    id: document.id,
    ...data,
    createdAt: mapTimestamp(data.createdAt),
    updatedAt: mapTimestamp(data.updatedAt)
  }
}

export async function listProducts({ limit, active }) {
  let query = productsCollection
    .orderBy('createdAt', 'desc')
    .limit(limit)

  if (active !== undefined) {
    query = productsCollection
      .where('active', '==', active)
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(mapProduct)
}

export async function findProductById(id) {
  const document = await productsCollection.doc(id).get()
  return mapProduct(document)
}

export async function findProductBySku(sku) {
  const snapshot = await productsCollection
    .where('sku', '==', sku)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return mapProduct(snapshot.docs[0])
}

export async function createProduct(data) {
  const productRef = productsCollection.doc()

  await productRef.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  const created = await productRef.get()
  return mapProduct(created)
}

export async function updateProduct(id, data) {
  const productRef = productsCollection.doc(id)

  await productRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  })

  const updated = await productRef.get()
  return mapProduct(updated)
}

export async function deleteProduct(id) {
  await productsCollection.doc(id).delete()
}
```

---

## 📁 `apps/api/src/modules/products/product.service.js`

```javascript
import { AppError } from '../../shared/errors/app-error.js'
import * as productRepository from './product.repository.js'

export async function listProducts(filters) {
  return productRepository.listProducts(filters)
}

export async function getProduct(id) {
  const product = await productRepository.findProductById(id)

  if (!product) {
    throw new AppError({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado'
    })
  }

  return product
}

export async function createProduct(data) {
  const existingProduct = await productRepository.findProductBySku(
    data.sku
  )

  if (existingProduct) {
    throw new AppError({
      statusCode: 409,
      code: 'PRODUCT_SKU_EXISTS',
      message: 'Ya existe un producto con ese SKU'
    })
  }

  return productRepository.createProduct(data)
}

export async function updateProduct(id, changes) {
  const currentProduct = await getProduct(id)

  if (changes.sku && changes.sku !== currentProduct.sku) {
    const existingProduct = await productRepository.findProductBySku(
      changes.sku
    )

    if (existingProduct) {
      throw new AppError({
        statusCode: 409,
        code: 'PRODUCT_SKU_EXISTS',
        message: 'Ya existe un producto con ese SKU'
      })
    }
  }

  return productRepository.updateProduct(id, changes)
}

export async function deleteProduct(id) {
  await getProduct(id)
  await productRepository.deleteProduct(id)
}
```

---

## 📁 `apps/api/src/modules/products/product.controller.js`

```javascript
import * as productService from './product.service.js'

export async function listProducts(req, res) {
  const products = await productService.listProducts(
    req.validated.query
  )

  return res.status(200).json({
    success: true,
    data: products,
    meta: {
      count: products.length,
      requestId: req.id
    }
  })
}

export async function getProduct(req, res) {
  const product = await productService.getProduct(
    req.validated.params.id
  )

  return res.status(200).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function createProduct(req, res) {
  const product = await productService.createProduct(
    req.validated.body
  )

  return res.status(201).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function updateProduct(req, res) {
  const product = await productService.updateProduct(
    req.validated.params.id,
    req.validated.body
  )

  return res.status(200).json({
    success: true,
    data: product,
    meta: {
      requestId: req.id
    }
  })
}

export async function deleteProduct(req, res) {
  await productService.deleteProduct(
    req.validated.params.id
  )

  return res.status(204).send()
}
```

---

## 📁 `apps/api/src/modules/products/product.schema.js`

```javascript
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
  active: activeSchema.default(true)
})

const updateProductBody = z
  .object({
    sku: skuSchema.optional(),
    name: nameSchema.optional(),
    description: z.string().trim().max(1000).optional(),
    price: priceSchema.optional(),
    stock: stockSchema.optional(),
    active: activeSchema.optional()
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
```

---

## 📁 `apps/api/src/modules/products/product.routes.js`

```javascript
import { Router } from 'express'

import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from './product.controller.js'

import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  listProductsSchema,
  updateProductSchema
} from './product.schema.js'

import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'

const router = Router()

router.get(
  '/',
  validate(listProductsSchema),
  asyncHandler(listProducts)
)

router.get(
  '/:id',
  validate(getProductSchema),
  asyncHandler(getProduct)
)

router.post(
  '/',
  validate(createProductSchema),
  asyncHandler(createProduct)
)

router.patch(
  '/:id',
  validate(updateProductSchema),
  asyncHandler(updateProduct)
)

router.delete(
  '/:id',
  validate(deleteProductSchema),
  asyncHandler(deleteProduct)
)

export default router
```

---
