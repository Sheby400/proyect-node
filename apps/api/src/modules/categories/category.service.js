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
