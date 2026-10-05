import express from "express";
import { registerForEvent, getMyRegistrations, cancelRegistration,} from "../controllers/registrationController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { registrationEventIdValidator, } from "../middlewares/validators.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/my", getMyRegistrations);
router.post("/:eventId", registrationEventIdValidator, validateRequest, registerForEvent);
router.patch("/:eventId/cancel", registrationEventIdValidator, validateRequest, cancelRegistration);

export default router;