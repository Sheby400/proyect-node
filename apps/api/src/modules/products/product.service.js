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
