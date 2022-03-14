import express from "express";
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import mediaRouter from "./services/media/index.js";
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import swaggerUI from "swagger-ui-express"
import yamljs from "yamljs"


const server = express()

const port = process.env.PORT

const yamlDocument = yamljs.load(join(process.cwd(), "./src/apiDescription.yml"))

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
server.use("/docs", swaggerUI.serve, swaggerUI.setup(yamlDocument))

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.table(listEndpoints(server))

server.listen(port, () => {
    console.log("🟢 Server is listening on port:", port)
})