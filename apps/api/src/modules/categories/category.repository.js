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
