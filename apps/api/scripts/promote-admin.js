import { db } from '../src/config/firebase.js'

const email = process.argv[2]

if (!email) {
  console.error('Uso: node apps/api/scripts/promote-admin.js correo@dominio.com')
  process.exit(1)
}

const snapshot = await db
  .collection('users')
  .where('email', '==', email.toLowerCase())
  .limit(1)
  .get()

if (snapshot.empty) {
  console.error('Usuario no encontrado')
  process.exit(1)
}

await snapshot.docs[0].ref.update({
  role: 'ADMIN'
})

console.log(`Usuario ${email} promovido a ADMIN`)
process.exit(0)
