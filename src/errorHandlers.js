export const badRequestHandler = (err, req, res, next) => {
    if (err.status === 400) {
        res.status(400).send({ message: err.message, errorsList: err.errorsList })
    } else {
        next(err)
    }
}

export const unauthorizedHandler = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).send({ message: err.message })
    } else {
        next(err)
    }
}

export const notFoundHandler = (err, req, res, next) => {
    console.log(err)
    if (err.status === 404) {
        res.status(404).send({ message: err.message })
    } else {
        next(err)
    }
}

export const genericErrorHandler = (err, req, res, next) => {
    console.log(`Hello I am the generic error handler here is the error ${err}`)
    res.status(500).send({ message: "Generic Server Error" })
    console.log(err)
}