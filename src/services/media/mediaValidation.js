import { body } from "express-validator"


export const newMediaValidation = [
    body("Title").notEmpty().withMessage("Title is a mandatory field!"),
    body("Year").notEmpty().withMessage("Year is a mandatory field!"),
    body("Type").notEmpty().withMessage("Type is a mandatory field!"),
    body("Poster").notEmpty().withMessage("Poster is a mandatory field!"),
]