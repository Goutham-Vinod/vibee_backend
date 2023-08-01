import { Router, raw } from "express"
import { handleWebHooks } from "../controllers/paymentController.js"

const router = Router()

router.post("/", raw({ type: "application/json" }), handleWebHooks)

export default router
