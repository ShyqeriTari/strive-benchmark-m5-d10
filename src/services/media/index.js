import express from "express"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import uniqid from "uniqid"
import { newMediaValidation } from "./mediaValidation.js"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"

const mediaJSONpath = join(dirname(fileURLToPath(import.meta.url)), "media.json")

const getMedia = () => JSON.parse(fs.readFileSync(mediaJSONpath))

const writeMedia = content => fs.writeFileSync(mediaJSONpath, JSON.stringify(content))

const mediaRouter = express.Router()

mediaRouter.post("/", newMediaValidation, (req, res, next) => {
    try {
        const mediaArray = getMedia()
        const errorGroup = validationResult(req)
        if(errorGroup.isEmpty()){
            const newMedia = {imdbID: uniqid(), ...req.body  }

            mediaArray.push(newMedia)

            writeMedia(mediaArray)

            res.status(201).send({newMedia})
        } else {
            next(createHttpError(400, "Some errors occurred in req body", {errorGroup}))
        }
    } catch (error) {
        next(error)
    }
})



export default mediaRouter