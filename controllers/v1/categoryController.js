const Category = require("../../models/Category")
const User = require ("../../models/User")

// @desc POST Create a category
// route POST /v1/category
// @access Private

const createCategoryHandler = async (req, res) => {
    try {
        const { name } = req.body
        if (typeof name !== "string") {
            res.status(400).json({ message: "Name must be a string" })
        }
        const checkCategory = await Category.findOne({
            where: {
                name
            }
        })
        if (checkCategory) {
            return res.status(400).json({ message: "Category already exists" })
        }
        const category = await Category.create({ name })
        return res.status(201).json({
            id: category.id,
            name: category.name
        })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc GET get a category
// route GET /v1/category/:id
// @access Public

const getCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }

        const category = await Category.findByPk(id)
        if (!category) {
            return res.status(400).json({ message: "Category not found" })
        }
        res.status(200).json(category)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc GET Retrieve categories
// route GET /v1/categories
// @access Public

const getCategoriesHandler = async (req, res) => {
    try {
        const categories = await Category.findAll()
        if (!categories) {
            return res.status(400).json({ message: "Category not found" })
        }
        res.status(200).json(categories)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc PUT Update a category
// @route PUT /v1/categories/:id
// access Private

const updateCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }
        if (typeof name !== "string") {
            return res.status(400).json({ message: "Name must be a string" })
        }

        const category = await Category.findByPk(id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }
        // Update the category
        category.name = name
        await category.save()
        res.status(200).json(category)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc DELETE Update a category
// @route DELETE /v1/categories/:id
// access Private

const deleteCategoryHandler = async (req, res) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({ message: "Id must be a string" })
        }
        const category = await Category.findByPk(id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }
        // Delete the category
        await category.destroy()
        res.status(204).json(category)

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}





module.exports = {
    createCategoryHandler,
    getCategoryHandler,
    getCategoriesHandler,
    updateCategoryHandler, 
    deleteCategoryHandler 
}