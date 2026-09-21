import { FieldValue } from 'firebase-admin/firestore'

import { db } from '../../config/firebase.js'

const productsCollection = db.collection('products')

function mapTimestamp(value) {
  return value?.toDate?.()?.toISOString() ?? null
}

function mapProduct(document) {
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

export async function listProducts({ limit, active }) {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20

  let query = productsCollection.limit(safeLimit)

  if (active === undefined) {
    query = productsCollection
      .orderBy('createdAt', 'desc')
      .limit(safeLimit)
  } else {
    query = productsCollection
      .where('active', '==', active)
      .limit(safeLimit)
  }

  const snapshot = await query.get()

  return snapshot.docs.map(mapProduct)
}

export async function findProductById(id) {
  const document = await productsCollection.doc(id).get()
  return mapProduct(document)
}

export async function findProductBySku(sku) {
  const snapshot = await productsCollection
    .where('sku', '==', sku)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  return mapProduct(snapshot.docs[0])
}

export async function createProduct(data) {
  const productRef = productsCollection.doc()

  await productRef.set({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  const created = await productRef.get()
  return mapProduct(created)
}

export async function updateProduct(id, data) {
  const productRef = productsCollection.doc(id)

  await productRef.update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  })

  const updated = await productRef.get()
  return mapProduct(updated)
}

export async function deleteProduct(id) {
  await productsCollection.doc(id).delete()
}
