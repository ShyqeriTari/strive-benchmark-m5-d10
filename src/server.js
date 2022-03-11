import express from "express";
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import mediaRouter from "./services/media/index.js";
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"

const server = express()

const port = process.env.PORT

const corsOrigin = [process.env.PROD, process.env.FE]

server.use(express.json())
server.use(cors({
    origin: function (origin, next) {

        if (!origin || corsOrigin.indexOf(origin !== -1)) {
            next(null, true)
        } else {
            next(new Error("cors error!"))
        }
    }
}))

server.use("/media", mediaRouter)

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.table(listEndpoints(server))

server.listen(port, () => {
    console.log("🟢 Server is listening on port:", port)
})