import express from "express";
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent,} from "../controllers/eventController.js";
import { protect, authorize,} from "../middlewares/authMiddleware.js";
import { eventValidator, updateEventValidator, eventIdValidator } from "../middlewares/validators.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", eventIdValidator, validateRequest, getEventById);
router.post( "/", protect,authorize("organizer", "admin"), eventValidator, validateRequest, createEvent);
router.patch("/:id", protect, authorize("organizer", "admin"), eventIdValidator, updateEventValidator, validateRequest, updateEvent);
router.delete("/:id", protect, authorize("organizer", "admin"), eventIdValidator, validateRequest, deleteEvent);

export default router;