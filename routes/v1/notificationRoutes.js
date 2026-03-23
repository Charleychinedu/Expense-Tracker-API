const express = require("express")
const {
    getNotificationsHandler
} = require("../../controllers/v1/notificationController")

const { validateToken } = require("../../middleware/auth")

const router = express.Router()


router.get("/", validateToken, getNotificationsHandler)

module.exports = router