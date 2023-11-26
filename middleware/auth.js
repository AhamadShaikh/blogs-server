
const jwt = require("jsonwebtoken")

const middleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) {
            return res.status(400).json("User Not Authorized")
        }

        const decode = jwt.verify(token, "ironman")

        if (!decode) {
            return res.status(400).json("User Not Authorized")
        }

        req.userId = decode.userId
        req.email = decode.email
        req.name = decode.name

        next()

    } catch (error) {
        console.log(error)
    }
}

module.exports = middleware