import * as orderService
  from './order.service.js'

export async function createOrder(
  req,
  res
) {
  const data =
    await orderService
      .createOrder(
        req.auth.userId
      )

  return res.status(201).json({
    success:
      true,

    data,

    meta: {
      requestId:
        req.id
    }
  })
}

export async function listOrders(
  req,
  res
) {
  const data =
    await orderService
      .listOrders(
        req.auth.userId
      )

  return res.status(200).json({
    success:
      true,

    data,

    meta: {
      count:
        data.length,

      requestId:
        req.id
    }
  })
}

export async function getOrder(
  req,
  res
) {
  const data =
    await orderService
      .getOrder(
        req.auth.userId,
        req.validated.params.id
      )

  return res.status(200).json({
    success:
      true,

    data,

    meta: {
      requestId:
        req.id
    }
  })
}
