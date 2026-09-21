import {
  AppError
} from '../../shared/errors/app-error.js'

import * as productRepository
  from '../products/product.repository.js'

import * as cartRepository
  from './cart.repository.js'

export async function getCart(
  userId
) {
  const items =
    await cartRepository
      .listItems(
        userId
      )

  const detailedItems = []

  let total = 0

  for (
    const item of items
  ) {
    const product =
      await productRepository
        .findProductById(
          item.productId
        )

    if (!product) {
      continue
    }

    const subtotal =
      product.price *
      item.quantity

    total += subtotal

    detailedItems.push({
      productId:
        product.id,

      sku:
        product.sku,

      name:
        product.name,

      price:
        product.price,

      quantity:
        item.quantity,

      subtotal
    })
  }

  return {
    items:
      detailedItems,

    total
  }
}

export async function addItem(
  userId,
  {
    productId,
    quantity
  }
) {
  const product =
    await productRepository
      .findProductById(
        productId
      )

  if (
    !product ||
    !product.active
  ) {
    throw new AppError({
      statusCode:
        404,

      code:
        'PRODUCT_NOT_AVAILABLE',

      message:
        'Producto no disponible'
    })
  }

  if (
    quantity >
    product.stock
  ) {
    throw new AppError({
      statusCode:
        409,

      code:
        'INSUFFICIENT_STOCK',

      message:
        'Stock insuficiente'
    })
  }

  await cartRepository
    .upsertItem(
      userId,
      productId,
      quantity
    )

  return getCart(userId)
}

export async function removeItem(
  userId,
  productId
) {
  await cartRepository
    .removeItem(
      userId,
      productId
    )

  return getCart(userId)
}
