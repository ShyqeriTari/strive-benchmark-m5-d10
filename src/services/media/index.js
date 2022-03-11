import express from "express"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import uniqid from "uniqid"
import { newMediaValidation } from "./mediaValidation.js"
import { newReviewValidation } from "./reviewValidation.js"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"

const mediaJSONpath = join(dirname(fileURLToPath(import.meta.url)), "media.json")

const getMedia = () => JSON.parse(fs.readFileSync(mediaJSONpath))

const writeMedia = content => fs.writeFileSync(mediaJSONpath, JSON.stringify(content))

const reviewJSONpath = join(dirname(fileURLToPath(import.meta.url)), "review.json")

const getReview = () => JSON.parse(fs.readFileSync(reviewJSONpath))

const writeReview = content => fs.writeFileSync(reviewJSONpath, JSON.stringify(content))

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

mediaRouter.post("/:mediaId/reviews", newReviewValidation, (req, res, next) => {
    try {
        const reviewArray = getReview()
        const errorGroup = validationResult(req)
        if(errorGroup.isEmpty()){
            const newReview = {_id: req.params.mediaId, ...req.body, elementId: uniqid(), createdAt: new Date() }

            reviewArray.push(newReview)

            writeReview(reviewArray)

            res.status(201).send({newReview})
        } else {
            next(createHttpError(400, "Some errors occurred in req body", {errorGroup}))
        }
    } catch (error) {
        next(error)
    }
})

mediaRouter.get("/", (req, res, next) => {
    try {
        const mediaArray = getMedia()

        const reviewArray = getReview()

        res.send({mediaArray, reviewArray})
    } catch (error) {
        next(error)
    }
})

mediaRouter.get("/:mediaId", (req, res, next) => {
    try {
        const mediaArray = getMedia()

        const singleMedia = mediaArray.find( media => media.imdbID === req.params.mediaId)

        const reviewArray = getReview()

        const singleMediaReview = reviewArray.filter(review => review._id === req.params.mediaId)

        res.send({singleMedia, singleMediaReview})

    } catch (error) {
        next(error)
    }
})

mediaRouter.put("/:mediaId", newMediaValidation, (req, res, next) => {

  try{ 
            const mediaArray = getMedia()

            const index = mediaArray.findIndex(media => media.imdbID === req.params.mediaId)

            const oldMedia = mediaArray[index]

            const updatedMedia = { ...oldMedia, ...req.body }

            mediaArray[index] =  updatedMedia

            writeMedia(mediaArray)

            res.status(201).send({updatedMedia})
  }
        catch (error){
            next(error)
        }
})

mediaRouter.delete("/:mediaId", (req, res, next) => {
    try {

        const mediaArray = getMedia()

        const remainingMedia = mediaArray.filter(media => media.imdbID !== req.params.mediaId)

        fs.writeFileSync( mediaJSONpath, JSON.stringify(remainingMedia))

        res.status(204).send("Deleted successfully")
        
    } catch (error) {
        next(error)
    }
})

mediaRouter.delete("/:reviewId/reviews", (req, res, next) => {
    try {

        const reviewArray = getReview()

        const remainingReview = reviewArray.filter(review => review.elementId !== req.params.reviewId)

        fs.writeFileSync( reviewJSONpath, JSON.stringify(remainingReview))

        res.status(204).send("Deleted successfully")
        
    } catch (error) {
        next(error)
    }
})


export default mediaRouter