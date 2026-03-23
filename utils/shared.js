const config = require("../config/config")
const Notification = require("../models/Notification")
const Expense = require("../models/Expense")
const { Op } = require("sequelize")

const checkMonthlyBudget = async (userId) => {
    try {
        const today = new Date()

        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        const expenses = await Expense.findAll(
            {
                where: {
                    UserId: userId,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            }
        )

        let total = 0
        expenses.forEach(expense => {
            total += Number(expense.amount)
        })

        if (total > config.expenseBudget) {
            await Notification.create({
                message: `You have exceeded your monthly budget of ${config.expenseBudget}`,
                UserId: userId
            })
            return true
        } else {
            return false
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { checkMonthlyBudget }