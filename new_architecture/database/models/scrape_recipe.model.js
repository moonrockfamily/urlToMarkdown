const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ScrapeRecipe = sequelize.define('ScrapeRecipe', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        extractionRuleIds: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        canonicalizationRuleIds: {
            type: DataTypes.JSON,
            defaultValue: []
        },
        sourceUrl: {
            type: DataTypes.STRING
        },
        sourceType: {
            type: DataTypes.STRING
        },
        version: {
            type: DataTypes.STRING
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
        // Timestamps (createdAt, updatedAt) are automatically added by Sequelize by default
    });
    return ScrapeRecipe;
};
