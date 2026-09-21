import * as cartService
  from './cart.service.js'

export async function getCart(
  req,
  res
) {
  const data =
    await cartService
      .getCart(
        req.auth.userId
      )

  return res
    .status(200)
    .json({
      success:
        true,

      data,

      meta: {
        requestId:
          req.id
      }
    })
}

export async function addItem(
  req,
  res
) {
  const data =
    await cartService
      .addItem(
        req.auth.userId,
        req.validated.body
      )

  return res
    .status(200)
    .json({
      success:
        true,

      data,

      meta: {
        requestId:
          req.id
      }
    })
}

export async function removeItem(
  req,
  res
) {
  const data =
    await cartService
      .removeItem(
        req.auth.userId,
        req.validated.params
          .productId
      )

  return res
    .status(200)
    .json({
      success:
        true,

      data,

      meta: {
        requestId:
          req.id
      }
    })
}
