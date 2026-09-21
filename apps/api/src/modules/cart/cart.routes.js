import {
  Router
} from 'express'

import * as controller
  from './cart.controller.js'

import * as schema
  from './cart.schema.js'

import {
  asyncHandler
} from '../../shared/middleware/async-handler.js'

import {
  authenticate
} from '../../shared/middleware/authenticate.middleware.js'

import {
  validate
} from '../../shared/middleware/validate.middleware.js'

const router =
  Router()

router.use(
  authenticate
)

router.get(
  '/',
  validate(
    schema.getCartSchema
  ),
  asyncHandler(
    controller.getCart
  )
)

router.post(
  '/items',
  validate(
    schema.addItemSchema
  ),
  asyncHandler(
    controller.addItem
  )
)

router.delete(
  '/items/:productId',
  validate(
    schema.removeItemSchema
  ),
  asyncHandler(
    controller.removeItem
  )
)

export default router
