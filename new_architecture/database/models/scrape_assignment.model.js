// filepath: c:\Users\thiles\gitrepo\urlToMarkdown\new_architecture\database\models\scrape_assignment.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ScrapeAssignment = sequelize.define('ScrapeAssignment', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        recipeId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'ScrapeRecipes', // Name of the table
                key: 'id'
            }
        },
        targetUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: { // e.g., 'pending', 'in-progress', 'completed', 'failed'
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        lastAttemptedAt: {
            type: DataTypes.DATE
        },
        completedAt: {
            type: DataTypes.DATE
        },
        failureReason: {
            type: DataTypes.TEXT
        },
        // Timestamps
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return ScrapeAssignment;
};
