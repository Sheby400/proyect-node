import {
  FieldValue
} from 'firebase-admin/firestore'

import {
  db
} from '../../config/firebase.js'

const ordersCollection =
  db.collection('orders')

function mapTimestamp(
  value
) {
  return (
    value
      ?.toDate?.()
      ?.toISOString() ??
    null
  )
}

function mapOrder(
  document
) {
  if (!document.exists) {
    return null
  }

  const data =
    document.data()

  return {
    id:
      document.id,

    ...data,

    createdAt:
      mapTimestamp(
        data.createdAt
      ),

    updatedAt:
      mapTimestamp(
        data.updatedAt
      )
  }
}

export async function createOrder({
  userId,
  items
}) {
  return db.runTransaction(
    async transaction => {
      const productRefs =
        items.map(
          item =>
            db
              .collection('products')
              .doc(
                item.productId
              )
        )

      const productDocs =
        await Promise.all(
          productRefs.map(
            reference =>
              transaction.get(
                reference
              )
          )
        )

      const finalItems = []

      let serverTotal = 0

      for (
        let index = 0;
        index < productDocs.length;
        index++
      ) {
        const document =
          productDocs[index]

        const requestedItem =
          items[index]

        if (!document.exists) {
          throw new Error(
            `PRODUCT_NOT_FOUND:${requestedItem.productId}`
          )
        }

        const product =
          document.data()

        if (
          !product.active ||
          product.stock <
            requestedItem.quantity
        ) {
          throw new Error(
            `INSUFFICIENT_STOCK:${requestedItem.productId}`
          )
        }

        const subtotal =
          product.price *
          requestedItem.quantity

        serverTotal += subtotal

        finalItems.push({
          productId:
            document.id,

          sku:
            product.sku,

          name:
            product.name,

          unitPrice:
            product.price,

          quantity:
            requestedItem.quantity,

          subtotal
        })

        transaction.update(
          document.ref,
          {
            stock:
              product.stock -
              requestedItem.quantity,

            updatedAt:
              FieldValue
                .serverTimestamp()
          }
        )
      }

      const orderRef =
        ordersCollection.doc()

      transaction.set(
        orderRef,
        {
          userId,

          status:
            'CREATED',

          items:
            finalItems,

          total:
            serverTotal,

          createdAt:
            FieldValue
              .serverTimestamp(),

          updatedAt:
            FieldValue
              .serverTimestamp()
        }
      )

      return orderRef.id
    }
  )
}

export async function findOrderById(
  id
) {
  const document =
    await ordersCollection
      .doc(id)
      .get()

  return mapOrder(
    document
  )
}

export async function listOrdersByUser(
  userId
) {
  const snapshot =
    await ordersCollection
      .where(
        'userId',
        '==',
        userId
      )
      .orderBy(
        'createdAt',
        'desc'
      )
      .get()

  return snapshot.docs.map(
    mapOrder
  )
}
