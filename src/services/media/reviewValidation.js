import { body } from "express-validator"


export const newReviewValidation = [
  body("comment").notEmpty().withMessage("comment is a mandatory field!"),
  body("rate").notEmpty().withMessage("rate is a mandatory field!")
]