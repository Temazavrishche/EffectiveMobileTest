import express from "express"
import ticketController from "../controllers/ticketController.js"

const router = express.Router()

router.post("/create", ticketController.createTicket)
router.put("/:id/work", ticketController.takeInWork)
router.put("/:id/complete", ticketController.completeTicket)
router.put("/:id/cancel", ticketController.cancelTicket)
router.get("/", ticketController.getTickets)
router.delete("/cancel-in-work", ticketController.cancelAllInWork)

export default router