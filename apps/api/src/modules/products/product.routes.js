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
import { authorize } from '../../shared/middleware/authorize.middleware.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'

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
  authenticate,
  authorize('products: create'),
  validate(createProductSchema),
  asyncHandler(createProduct)
)

router.patch(
  '/:id',
  authenticate,
  authorize('products: update'),
  validate(updateProductSchema),
  asyncHandler(updateProduct)
)

router.delete(
  '/:id',
  authenticate,
  authorize('products: delete'),
  validate(deleteProductSchema),
  asyncHandler(deleteProduct)
)

export default router
