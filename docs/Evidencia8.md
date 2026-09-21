# Evidencia 8 — CRUD de Categorías

## 📁 `apps/api/src/modules/categories/category.repository.js`

```javascript
import { FieldValue } from "firebase-admin/firestore"
import { db } from "../../config/firebase.js"

const categoriesCollection = db.collection('categories')

function mapTimestamp(value) {
  return value?.toDate?.()?.toISOString() ?? null
}

function mapCategory(document) {
  if (!document.exists) {
    return null
  }

  const data = document.data()

  return {
    id: document.id,
    ...data,
    createdAt: mapTimestamp(data.createdAt),
    updatedAt: mapTimestamp(data.updatedAt)
  }
}

export async function listCategories() {
    const categories = await categoriesCollection.orderBy('name').get()
    return categories.docs.map(mapCategory)
}

export async function findCategoryById(id) {
    const category = await categoriesCollection.doc(id).get()
    return mapCategory(category)
}

export async function findCategoryBySlug(slug) {
    const category = await categoriesCollection.where('slug', '==', slug).limit(1).get()
    return category.empty ? null : mapCategory(category.docs[0])
}

export async function createCategory(data) {
    const category = categoriesCollection.doc()
    await category.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    })
    return mapCategory(await category.get())
}

export async function updateCategory(id, data) {
    const category = categoriesCollection.doc(id)
    await category.update({
        ...data,
        updatedAt: FieldValue.serverTimestamp()
    })
    return mapCategory(await category.get())
}

export async function deleteCategory(id){
    await categoriesCollection.doc(id).delete()
}
```

---

## 📁 `apps/api/src/modules/categories/category.service.js`

```javascript
import { AppError } from '../../shared/errors/app-error.js'
import * as categoryRepository from './category.repository.js'

export async function listCategories() {
    return categoryRepository.listCategories()
}

export async function getCategory(id) {
    const category = await categoryRepository.findCategoryById(id)
    if(!category) {
        throw new AppError({
            statusCode: 404,
            code: 'CATEGORY_NOT_FOUND',
            message: 'Categoría no encontrada'
        })
    }
    return category
}

export async function createCategory(data) {
    const exists = await categoryRepository.findCategoryBySlug(data.slug)
    if (exists) {
        throw new AppError({
            statusCode: 404,
            code: 'CATEGORY_SLUG_EXISTS',
            message: 'El slug ya existe'
        })
    }
    return categoryRepository.createCategory(data)
}

export async function updateCategory(id, data) {
    await getCategory(id)
    if (data.slug) {
        const exists = await categoryRepository.findCategoryBySlug(data.slug)

        if(exists && exists.id !== id) {
            throw new AppError({
            statusCode: 409,
            code: 'CATEGORY_SLUG_EXISTS',
            message: 'El slug ya existe'
        })
        }
    }
    return categoryRepository.updateCategory(id, data)
}

export async function deleteCategory(id) {
    await getCategory(id)
    await categoryRepository.deleteCategory(id)
}
```

---

## 📁 `apps/api/src/modules/categories/category.controller.js`

```javascript
import * as categoryService
  from './category.service.js'

export async function listCategories(
  req,
  res
) {
  const data =
    await categoryService
      .listCategories()

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

export async function getCategory(
  req,
  res
) {
  const data =
    await categoryService
      .getCategory(
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

export async function createCategory(
  req,
  res
) {
  const data =
    await categoryService
      .createCategory(
        req.validated.body
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

export async function updateCategory(
  req,
  res
) {
  const data =
    await categoryService
      .updateCategory(
        req.validated.params.id,
        req.validated.body
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

export async function deleteCategory(
  req,
  res
) {
  await categoryService
    .deleteCategory(
      req.validated.params.id
    )

  return res
    .status(204)
    .send()
}
```

---

## 📁 `apps/api/src/modules/categories/category.routes.js`

```javascript
import { Router } from 'express'
import * as controller from './category.controller.js'
import * as schema from './category.schema.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'
import { authorize } from '../../shared/middleware/authorize.middleware.js'
import { authenticate } from '../../shared/middleware/authenticate.middleware.js'

const router = Router()

router.get('/', validate(schema.listCategoriresSchema), asyncHandler(controller.getCategory))
router.post('/',
    authenticate,
    authorize('products: create'),
    validate(schema.createCategorySchema),
    asyncHandler(controller.createCategory))

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
```

---

## 📁 `apps/api/src/modules/categories/category.schema.js`

```javascript
import { z } from 'zod'

const empty = z.object({}).default({})

const params = z.object({
    id: z.string().trim().min(1)
})

const categoryBody = z.object({
    name: z.string().trim().min(2).max(100),
    slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+$/),
    active: z.boolean().default(true)
})

export const listCategoriesSchema = z.object({
    body: empty,
    params: empty,
    query: empty
})

export const getCategorySchema = z.object({
    body: empty,
    params: empty,
    query: empty
})

export const createCategorySchema = z.object({
    body: categoryBody,
    params: empty,
    query: empty
})

export const updateCategorySchema = z.object({
    body: categoryBody.partial().refine(value =>
        Object.keys(value).legth > 0 , {
        message: 'Es requerido mínimo un campo'
    }),
    params,
    query: empty
})

export const deleteCategorySchema = z.object({
    body: empty,
    params,
    query: empty
})
```
