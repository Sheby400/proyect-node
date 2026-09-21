import { Router } from 'express'
import * as controller from './category.controller.js'
import * as schema from './category.schema.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { authorize } from '../../shared/middleware/authorize.middleware.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'

const router = Router()

router.get('/',
    validate(schema.listCategoriesSchema),
    asyncHandler(controller.listCategories)
)

router.get(
  '/:id',
  validate(schema.getCategorySchema),
  asyncHandler(controller.getCategory)
)

router.post('/',
    authenticate,
    authorize('products: create'),
    validate(schema.createCategorySchema),
    asyncHandler(controller.createCategory)
)
router.patch('/:id',
    authenticate,
    authorize('products: update'),
    validate(schema.updateCategorySchema),
    asyncHandler(controller.updateCategory)
)

router.delete('/:id',
    authenticate,
    authorize('products: delete'),
    validate(schema.deleteCategorySchema),
    asyncHandler(controller.deleteCategory)
)

export default router
