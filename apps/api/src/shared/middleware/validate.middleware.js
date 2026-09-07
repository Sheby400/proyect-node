import { ZodError } from 'zod'
import { AppError } from '../errors/app-error.js'

export function validate(schema) {
  return function validationMiddleware(req, _res, next) {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      })

      req.validated = result

      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError({
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.issues
          })
        )
      }

      return next(error)
    }
  }
}
