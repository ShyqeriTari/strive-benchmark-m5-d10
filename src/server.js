import express from "express";
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import mediaRouter from "./services/media/index.js";

const server = express()

const port = process.env.PORT

const corsOrigin =  [process.env.PROD, process.env.FE]

server.use(express.json())
server.use(cors({origin: function(origin, next){

    if(!origin || corsOrigin.indexOf(origin !== -1)){
      next(null, true)
    } else{
       next(new Error ("cors error!"))
    }
  }}))

  server.use("/media", mediaRouter)

console.table(listEndpoints(server))

server.listen(port, () => {
    console.log("🟢 Server is listening on port:", port)
})