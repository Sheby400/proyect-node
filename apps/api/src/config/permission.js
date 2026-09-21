export const permissionsByRole = Object.freeze({
  CUSTOMER: new Set([
    'products: read',
    'orders: create',
    'orders: read-own'
  ]),
  ADMIN: new Set([
    'products: read',
    'products: create',
    'products: update',
    'products: delete',
    'users: read',
    'orders: read',
    'orders: update'
  ]),
  SUPER_ADMIN: new Set(['*'])
})
