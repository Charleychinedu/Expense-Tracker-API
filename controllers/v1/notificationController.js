const Notification = require("../../models/Notification")
const User = require("../../models/User")

// @desc GET All notifications
// @route GET v1/notifications/:id
// @access Private
const getNotificationsHandler = async (req, res) => {
    try {
        const notification = await Notification.findAll({
            where: {
                UserId: req.user.id
            },
            order: [["createdAt", "DESC"]]
        })
        res.status(200).json(notification)
        await Notification.setUser(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getNotificationsHandler
}