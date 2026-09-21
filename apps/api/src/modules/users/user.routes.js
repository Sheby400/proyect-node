import { Router } from "express";
import { me } from "./user.controller.js";
import { asyncHandler } from "../../shared/middleware/async-handler.js";
import { authenticate } from "../../shared/middleware/authenticate.middleware.js";

const router = Router()

router.get('/me', authenticate, asyncHandler(me))

export default router
