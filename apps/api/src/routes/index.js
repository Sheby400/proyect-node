import { Router } from 'express'

import healthRoutes from './../modules/health/health.routes.js'
import productRoutes from './../modules/products/product.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/products', productRoutes)

export default router
