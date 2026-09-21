import { Router } from 'express'
import { login, refresh, register } from './auth.controller.js'
import { registerSchema, loginSchema, refreshSchema } from './auth.schema.js'
import { asyncHandler } from '../../shared/middleware/async-handler.js'
import { validate } from '../../shared/middleware/validate.middleware.js'

const router = Router()

router.post('/register', validate(registerSchema), asyncHandler(register))
router.post('/login', validate(loginSchema), asyncHandler(login))
router.post('/refresh', validate(refreshSchema), asyncHandler(refresh))

export default router
