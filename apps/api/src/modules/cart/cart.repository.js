import { db } from '../../config/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

function cartRef (userId) {
    return db.collection('carts').doc(userId)
}

function itemsRef (userId) {
    return cartRef(userId).collection('items')
}

export async function listItems(userId) {
    const items = await itemsRef(userId).get()
    return items.docs.map(doc => ({
        productId: doc.id,
        ...doc.data()
    }))
}

export async function upsertItem (userId, productId, quantity) {
    await cartRef(userId).set({
        updatedAt: FieldValue.serverTimestamp()
    }, {
        merge: true
    })
    await itemsRef(userId).doc(productId).set({
        quantity,
        updatedAt: FieldValue.serverTimestamp()
    }, {
        merge:true
    })
}

export async function removeItem (userId, productId) {
    await itemsRef(userId).doc(productId).delete()
}

export async function clearCart(userId) {
    const cart = await itemsRef(userId).get()
    const batch = db.batch()
    cart.docs.forEach(doc => {
        batch.delete(doc.ref)
    })
    await batch.commit()
}
