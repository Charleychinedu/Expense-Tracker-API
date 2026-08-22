const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("../../config/config")
const User = require("../../models/User")

// @desc POST Create a User
// route POST /v1/user
// @access Public 

const createUserHandler = async (req, res) => {
    try {
        let { name, email, password } = req.body

        if (typeof name !== "string") {
            return res.status(400).json({ message: "Name must be a string" })
        }
        if (typeof email !== "string") {
            return res.status(400).json({ message: "Email must be a string" })
        }
        if (typeof password !== "string") {
            return res.status(400).json({ message: "Password must be a string" })
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
        })
    

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc GET All Users
// route GET /v1/user/:id
// @access Public 

const getUserHandler = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "ID must be a string" })
        }
        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        })

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// @desc Login Users
// route POST /v1/user/login
// @access Public 

const loginUserHandler = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string") {
            return res.status(400).json({ message: "Email must be a string" })
        }
        if (typeof password !== "string") {
            return res.status(400).json({ message: "Password must be a string" })
        }

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({ message: "Invalid email" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" })
        }

        const payload = {
            id: user.id,
            email: user.email
        }

        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" })
        res.status(200).json({ token })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


module.exports = {
    createUserHandler,
    getUserHandler,
    loginUserHandler
} 