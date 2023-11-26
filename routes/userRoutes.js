const express = require("express")
const router = express.Router()
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const BlacklistToken = require("../models/blacklistToken")

router.post("/register", async (req, res) => {
    const { email, password } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json("User Already Registered")
        }

        const newPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({ ...req.body, password: newPassword })

        return res.status(200).json("User Registered Successfully")

    } catch (error) {
        return res.status(500).json("something went wrong")
    }
})

router.post("/login", async (req, res) => {
    const { username, email, password } = req.body
    try {

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json("User Not Found")
        }

        const comPass = await bcrypt.compare(password, user.password)

        if (!comPass) {
            return res.status(400).json("Wrong Credentials")
        }

        const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, "ironman", { expiresIn: "3d" })

        const rToken = jwt.sign({ userId: user._id, email: user.email, name: user.name }, "thanos", { expiresIn: "5d" })

        return res.status(200).json({ msg: "User Login Successfully", token: token, refreshToken: rToken })

    } catch (error) {
        return res.status(500).json("Internal Server Error")
    }
})

router.get("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ msg: "Token not provided" });
        }

        const isBlacklisted = await BlacklistToken.exists({ token });

        if (isBlacklisted) {
            return res.status(400).json({ msg: "Token has already been invalidated" });
        }

        await BlacklistToken.create({ token });

        return res.status(200).json({ msg: "User Logout Successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});


module.exports = router