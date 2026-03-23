const express = require("express")

const {
    createExpenseHandler,
    getExpenseHandler,
    getExpensesHandler,
    updateExpenseHandler,
    deleteExpenseHandler,
    getExpenseSummaryHandler,
    downloadExpenseSummaryHandler
} = require("../../controllers/v1/expensesController")
const { validateToken } = require("../../middleware/auth")

const router = express.Router()

router.get("/summary", validateToken, getExpenseSummaryHandler)
router.post("", validateToken, createExpenseHandler)
router.get("/:id", validateToken, getExpenseHandler)
router.get("", validateToken, getExpensesHandler)
router.put("/:id", validateToken, updateExpenseHandler)
router.delete("/:id", validateToken, deleteExpenseHandler)
router.get("/summary/download", validateToken, downloadExpenseSummaryHandler)


module.exports = router