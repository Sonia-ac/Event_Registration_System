import { body, param } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const eventValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Event title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("event_date")
    .isISO8601()
    .withMessage("Enter a valid event date"),

  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
];

export const eventIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid event ID"),
];

export const registrationEventIdValidator = [
  param("eventId")
    .isInt({ min: 1 })
    .withMessage("Invalid event ID"),
];


export const updateEventValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Event title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("description")
    .optional()
    .trim(),

  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty"),

  body("event_date")
    .optional()
    .isISO8601()
    .withMessage("Enter a valid event date"),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
];