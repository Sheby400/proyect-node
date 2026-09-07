export class AppError extends Error {
  constructor({
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    message = 'Internal server error',
    details = undefined
  } = {}) {
    super(message)

    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}
