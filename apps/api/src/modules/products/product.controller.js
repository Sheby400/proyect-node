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
