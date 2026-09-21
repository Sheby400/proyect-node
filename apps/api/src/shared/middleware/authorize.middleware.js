import { permissionsByRole } from '../../config/permission.js'
import { AppError } from '../errors/app-error.js'

export function authorize(requiredPermissions) {
  return function authorizationMiddleware(req, _res, next) {
    const role = req.auth?.role
    const rolePermissions = permissionsByRole[role]

    if (!Array.isArray(requiredPermissions)) {
      requiredPermissions = [requiredPermissions]
    }

    const hasSuperAdminAccess = rolePermissions?.has('*')
    const hasRequiredPermissions = requiredPermissions.every((permission) => {
      return hasSuperAdminAccess || rolePermissions?.has(permission)
    })

    if (!role || !hasRequiredPermissions) {
      return next(
        new AppError({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'No tiene permisos para realizar la operacion'
        })
      )
    }

    return next()
  }
}
