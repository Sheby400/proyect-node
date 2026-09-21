import {
  AppError
} from '../../shared/errors/app-error.js'

import * as cartRepository
  from '../cart/cart.repository.js'

import * as orderRepository
  from './order.repository.js'

export async function createOrder(
  userId
) {
  const cartItems =
    await cartRepository
      .listItems(
        userId
      )

  if (
    cartItems.length === 0
  ) {
    throw new AppError({
      statusCode:
        409,

      code:
        'EMPTY_CART',

      message:
        'El carrito está vacío'
    })
  }

  let orderId

  try {
    orderId =
      await orderRepository
        .createOrder({
          userId,
          items:
            cartItems
        })
  } catch (error) {
    if (
      String(
        error.message
      ).startsWith(
        'PRODUCT_NOT_FOUND:'
      )
    ) {
      throw new AppError({
        statusCode:
          409,

        code:
          'PRODUCT_NOT_AVAILABLE',

        message:
          'Uno de los productos ya no existe'
      })
    }

    if (
      String(
        error.message
      ).startsWith(
        'INSUFFICIENT_STOCK:'
      )
    ) {
      throw new AppError({
        statusCode:
          409,

        code:
          'INSUFFICIENT_STOCK',

        message:
          'Stock insuficiente para completar la orden'
      })
    }

    throw error
  }

  await cartRepository
    .clearCart(
      userId
    )

  return orderRepository
    .findOrderById(
      orderId
    )
}

export async function listOrders(
  userId
) {
  return orderRepository
    .listOrdersByUser(
      userId
    )
}

export async function getOrder(
  userId,
  id
) {
  const order =
    await orderRepository
      .findOrderById(
        id
      )

  if (
    !order ||
    order.userId !== userId
  ) {
    throw new AppError({
      statusCode:
        404,

      code:
        'ORDER_NOT_FOUND',

      message:
        'Orden no encontrada'
    })
  }

  return order
}
