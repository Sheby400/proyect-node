import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../config/firebase.js";

const usersCollection = db.collection('users')

function mapTimeStamp(value) {
    return value?.toDate?.()?.toISOString()?? null
}

function mapUser (document) {
    if (!document.exists){
        return null
    }
    const data = document.data()

    return{
        id:document.id,
        email: data.email,
        name: data.name,
        role: data.role,
        active: data.active,
        createdAt: mapTimeStamp(data.createdAt),
        updatedAt: mapTimeStamp(data.updatedAt)
    }
}

export async function createUser (data) {
    const user = usersCollection.doc()
    await user.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    })
    const created = await user.get()
    return mapUser(created)
}

export async function findById (id) {
    const doc = await usersCollection.doc(id).get()
    return mapUser(doc)
}

export async function findByEmail (email) {
    const user = await usersCollection.where('email', '==', email)
        .limit(1)
        .get()
    if (user.empty) {
        return null
    }

    const foundUser = user.docs[0]
    return {
        ...mapUser(foundUser),
        passwordHash: foundUser.data().passwordHash
    }
}
