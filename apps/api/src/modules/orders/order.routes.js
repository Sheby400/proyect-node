import {
  Router
} from 'express'

import * as controller
  from './order.controller.js'

import * as schema
  from './order.schema.js'

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

router.post(
  '/',
  validate(
    schema.createOrderSchema
  ),
  asyncHandler(
    controller.createOrder
  )
)

router.get(
  '/',
  validate(
    schema.listOrdersSchema
  ),
  asyncHandler(
    controller.listOrders
  )
)

router.get(
  '/:id',
  validate(
    schema.getOrderSchema
  ),
  asyncHandler(
    controller.getOrder
  )
)

export default router
