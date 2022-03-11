import express from "express"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import uniqid from "uniqid"
import { newMediaValidation } from "./mediaValidation.js"
import { newReviewValidation } from "./reviewValidation.js"
import createHttpError from "http-errors"
import { validationResult } from "express-validator"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import multer from "multer"
import { getPDFstream } from "../../lib/pdf-tools.js"
import { pipeline } from "stream"
import axios from "axios"

const mediaJSONpath = join(dirname(fileURLToPath(import.meta.url)), "media.json")

const getMedia = () => JSON.parse(fs.readFileSync(mediaJSONpath))

const writeMedia = content => fs.writeFileSync(mediaJSONpath, JSON.stringify(content))

const reviewJSONpath = join(dirname(fileURLToPath(import.meta.url)), "review.json")

const getReview = () => JSON.parse(fs.readFileSync(reviewJSONpath))

const writeReview = content => fs.writeFileSync(reviewJSONpath, JSON.stringify(content))

const mediaRouter = express.Router()

const cloudStorageMedia = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "netflixM5",
    },
})
const cloudMulterMedia = multer({ storage: cloudStorageMedia })

mediaRouter.post("/", newMediaValidation, (req, res, next) => {
    try {
        const mediaArray = getMedia()
        const errorGroup = validationResult(req)
        if (errorGroup.isEmpty()) {
            const newMedia = { imdbID: uniqid(), ...req.body }

            mediaArray.push(newMedia)

            writeMedia(mediaArray)

            res.status(201).send({ newMedia })
        } else {
            next(createHttpError(400, "Some errors occurred in req body", { errorGroup }))
        }
    } catch (error) {
        next(error)
    }
})

mediaRouter.post("/:mediaId/reviews", newReviewValidation, (req, res, next) => {
    try {
        const reviewArray = getReview()
        const errorGroup = validationResult(req)
        if (errorGroup.isEmpty()) {
            const newReview = { _id: req.params.mediaId, ...req.body, elementId: uniqid(), createdAt: new Date() }

            reviewArray.push(newReview)

            writeReview(reviewArray)

            res.status(201).send({ newReview })
        } else {
            next(createHttpError(400, "Some errors occurred in req body", { errorGroup }))
        }
    } catch (error) {
        next(error)
    }
})

mediaRouter.get("/", (req, res, next) => {
    try {
        const mediaArray = getMedia()

        const reviewArray = getReview()

        res.send({ mediaArray, reviewArray })
    } catch (error) {
        next(error)
    }
})

mediaRouter.get("/:mediaId", (req, res, next) => {
    try {
        const mediaArray = getMedia()

        const singleMedia = mediaArray.find(media => media.imdbID === req.params.mediaId)

        const reviewArray = getReview()

        const singleMediaReview = reviewArray.filter(review => review._id === req.params.mediaId)

        res.send({ singleMedia, singleMediaReview })

    } catch (error) {
        next(error)
    }
})

mediaRouter.put("/:mediaId", newMediaValidation, (req, res, next) => {

    try {
        const mediaArray = getMedia()

        const index = mediaArray.findIndex(media => media.imdbID === req.params.mediaId)

        const oldMedia = mediaArray[index]

        const updatedMedia = { ...oldMedia, ...req.body }

        mediaArray[index] = updatedMedia

        writeMedia(mediaArray)

        res.status(201).send({ updatedMedia })
    }
    catch (error) {
        next(error)
    }
})

mediaRouter.delete("/:mediaId", (req, res, next) => {
    try {

        const mediaArray = getMedia()

        const remainingMedia = mediaArray.filter(media => media.imdbID !== req.params.mediaId)

        fs.writeFileSync(mediaJSONpath, JSON.stringify(remainingMedia))

        const reviewArray = getReview()

        const remainingReview = reviewArray.filter(review => review._id !== req.params.mediaId)

        fs.writeFileSync(reviewJSONpath, JSON.stringify(remainingReview))

        res.status(204).send("Deleted successfully")

    } catch (error) {
        next(error)
    }
})

mediaRouter.delete("/:reviewId/reviews", (req, res, next) => {
    try {

        const reviewArray = getReview()

        const remainingReview = reviewArray.filter(review => review.elementId !== req.params.reviewId)

        fs.writeFileSync(reviewJSONpath, JSON.stringify(remainingReview))

        res.status(204).send("Deleted successfully")

    } catch (error) {
        next(error)
    }
})

mediaRouter.post("/:mediaId/poster", cloudMulterMedia.single("poster"), async (req, res, next) => {
    try {

        const mediaArray = await getMedia()

        const index = mediaArray.findIndex(media => media.imdbID === req.params.mediaId)

        if (index !== -1) {

            const oldMedia = mediaArray[index]

            const updatedMedia = { ...oldMedia, Poster: req.file.path }

            mediaArray[index] = updatedMedia

            await writeMedia(mediaArray)

            res.send("Uploaded blogs on Cloudinary!")
        } else {
            next(createHttpError(404))
        }
    } catch (error) {
        next(error)
        console.log(error)
    }
})

mediaRouter.get("/:mediaId/pdf", async (req, res) => {

    try {
        const mediaArray = getMedia()
        const index = mediaArray.findIndex(media => media.imdbID === req.params.mediaId)
        const thisMedia = mediaArray[index]
        res.setHeader("Content-Disposition", `attachment; filename=${thisMedia.title}.pdf`)

        const response = await axios.get(thisMedia.Poster, {
            responseType: "arraybuffer",
        })
        const mediaPosterURLParts = thisMedia.Poster.split("/");
        const fileName = mediaPosterURLParts[mediaPosterURLParts.length - 1];
        const [extension] = fileName.split(".");
        const base64 = response.data.toString("base64");
        const base64Image = `data:image/${extension};base64,${base64}`;

        const reviewArray = getReview()

        const singleMediaReview = reviewArray.filter(review => review._id === req.params.mediaId)

        const source = getPDFstream(thisMedia.Title, thisMedia.Year, singleMediaReview.map(review => "Comment: " + review.comment + " - Rate: " + review.rate), base64Image)

        const destination = res

        pipeline(source, destination, err => {
            console.log(err)
        })
    } catch (error) {
        console.log(error)
    }
})


export default mediaRouter