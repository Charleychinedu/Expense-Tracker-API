const Expense = require("../../models/Expense")
const User = require("../../models/User")
const Category = require("../../models/Category")
const { Op } = require("sequelize")
const { checkMonthlyBudget } = require("../../utils/shared")
const { createObjectCsvWriter } = require("csv-writer")
const fs = require("fs")
const path = require("path")

// @desc POST Create expenses
// @route POST v1/expenses
// @access Public

const createExpenseHandler = async (req, res) => {
    try {
        const user = req.user
        const { narration, amount, categoryId } = req.body

        if (typeof narration !== "string") {
            return res.status(400).json({ message: "Narration must be a string" })
        }
        if (typeof amount !== "number") {
            return res.status(400).json({ message: "Amount must be a number" })
        }
        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "CategoryId must be a string" })
        }
        const category = await Category.findByPk(categoryId)
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        const hasExceededBudget = await checkMonthlyBudget(user.id)
        if (hasExceededBudget) {
            return res.status(400).json({
                message: "You have exceeded your monthly budget"
            })
        } else {
            const expense = await Expense.create({
                amount,
                narration
            })
            await expense.setUser(user)
            await expense.setCategory(category)
            res.status(201).json(expense)
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc GET All expenses
// @route GET v1/expense
// @access Public


const getExpensesHandler = async (req, res) => {
    try {
        const user = req.user
        let { search, startDate, endDate } = req.query

        if (search) {
            if (typeof search !== "string") {
                return res.status(400).json({ message: "Search must be a string" })
            }

            const category = await Category.findOne({
                where: {
                    name: search
                }
            })
            // Fetch expenses by filtering the category if it exists, or search by narration or amount
            const expenses = await Expense.findAll({
                where: {
                    UserId: user.id,

                    ...(category && { CategoryId: category.id }),

                    [Op.or]: [
                        {
                            narration: {
                                [Op.iLike]: `%${search}%`
                            }
                        },
                        {
                            amount: search
                        }
                    ]
                },
                order: [['createdAt', 'DESC']]
            })

            if (!expenses.length) {
                return res.status(404).json({ message: "Expenses not found" })
            }

            return res.status(200).json(expenses)
        }

        if (startDate && endDate) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)
            // Add an extra date to the end Date
            endDate.setDate(endDate.getDate() + 1)

            const expenses = await Expense.findAll({
                where: {
                    UserId: user.id,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                order: [['createdAt', 'DESC']]
            })


            return res.status(200).json(expenses)
        }
        // Fetch all user expenses
        const expenses = await Expense.findAll({
            where: {
                UserId: user.id
            }
        })
        res.status(200).json(expenses)

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// @desc GET an expenses
// @route GET v1/expense/:id
// @access Private
const getExpenseHandler = async (req, res) => {
    try {
        const { id } = req.params
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }

        // Get expense by ID
        const expense = await Expense.findByPk(id)
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" })
        }
        res.status(200).json(expense)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc PUT Update expenses
// @route PUT v1/expenses/:id
// @access Private

const updateExpenseHandler = async (req, res) => {
    try {
        const { id } = req.params
        const { narration, amount, categoryId } = req.body

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }
        if (typeof narration !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }
        if (typeof amount !== "number") {
            return res.status(400).json({ message: "Amount must be a number" })
        }
        if (typeof categoryId !== "string") {
            return res.status(400).json({ message: "categoryId must be a string" })
        }

        const category = await Category.findByPk(categoryId)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }
        const expenses = await Expense.findByPk(id)
        if (!expenses) {
            return res.status(404).json({ message: "Expenses not found" })
        }

        // The updating
        expenses.narration = narration
        expenses.amount = amount
        await expenses.save()

        expenses.setCategory(category)
        res.status(200).json(expenses)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}



// @desc DELETE Delete expenses
// @route DELETE v1/expenses/:id
// @access Private
const deleteExpenseHandler = async (req, res) => {
    try {
        const { id } = req.params
        if (typeof id !== "string") {
            return res.status(400).json({ message: "ID must be a string" })
        }
        const expense = await Expense.findByPk(id)
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" })
        }
        // Delete the category
        expense.destroy()
        res.status(204).json(expense)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc GET Expense Summary
// route GET /v1/expenses/summary
// access Private

const getExpenseSummaryHandler = async (req, res) => {
    try {
        const user = req.user
        let { startDate, endDate } = req.query
        let expenses = []
        if (startDate && endDate) {
            startDate = new Date(startDate)
            endDate = new Date(endDate)
            // Add an extra date to the end Date 
            endDate.setDate(endDate.getDate() + 1)

            expenses = await Expense.findAll({
                where: {
                    UserId: user.id,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            })
        } else {
            expenses = await Expense.findAll({
                where: {
                    UserId: user.id
                }
            })
        }

        let total = 0
        let average = 0

        expenses.forEach(expense => {
            total += Number(expense.amount)
        })

        if (expenses.length > 0) {
            average = total / expenses.length
        }

        res.status(200).json({
            total,
            average
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc Download Expense Summary
// @route /v1/expenses/summary/download
// @access Private

const downloadExpenseSummaryHandler = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: {
                UserId: req.user.id
            }
        })

        const filePath = path.join(__dirname, `expenses-${req.user.id}.csv`)
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: "id", title: "ID" },
                { id: "amount", title: "Amount" },
                { id: "narration", title: "Narration" },
                { id: "createdAt", title: "Created At" }
            ]
        })
        const expensesData = expenses.map(expense => ({
            id: expense.id,
            amount: expense.amount,
            narration: expense.narration,
            createdAt: expense.createdAt.toISOString().split("T")[0]
        }))

        await csvWriter.writeRecords(expensesData)
        res.download(filePath, 'expenses.csv', (error) => {
            if (error) {
                return res.status(500).json({
                    message: error.message
                })
            }
            fs.unlinkSync(filePath)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}



module.exports = {
    createExpenseHandler,
    getExpensesHandler,
    getExpenseHandler,
    getExpenseSummaryHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
    downloadExpenseSummaryHandler
}

