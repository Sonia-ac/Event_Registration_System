import express from "express";
import {register, login,} from "../controllers/authController.js";
import {protect} from "../middlewares/authMiddleware.js";
import {registerValidator, loginValidator} from "../middlewares/validators.js";
import {validateRequest} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export default router;