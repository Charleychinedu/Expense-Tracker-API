const { DataTypes } = require("sequelize");
const sequelize = require("../db")
const User = require("./User")
const Category = require("./Category")

const Expense = sequelize.define("Expenses", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    narration: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    timestamps: true
})

Expense.belongsTo(Category)
Expense.belongsTo(User)

module.exports = Expense;

