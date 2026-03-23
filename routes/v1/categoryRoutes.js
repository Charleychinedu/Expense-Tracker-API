const express = require("express")
const {
    createCategoryHandler,
    getCategoryHandler,
    getCategoriesHandler,
    updateCategoryHandler,
    deleteCategoryHandler
} = require ("../../controllers/v1/categoryController")

const {validateToken} = require("../../middleware/auth")

const router = express.Router()

router.post("", validateToken, createCategoryHandler)

router.get("/:id", getCategoryHandler)

router.get("", getCategoriesHandler)

router.put("/:id", validateToken, updateCategoryHandler)

router.delete("/:id", validateToken, deleteCategoryHandler)

module.exports = router