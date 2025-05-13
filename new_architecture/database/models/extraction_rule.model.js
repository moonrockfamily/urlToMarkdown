// filepath: c:\Users\thiles\gitrepo\urlToMarkdown\new_architecture\database\models\extraction_rule.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ExtractionRule = sequelize.define('ExtractionRule', {
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
        selector: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attribute: {
            type: DataTypes.STRING // e.g., 'textContent', 'href', or null for full element
        },
        extractorType: { // e.g., 'text', 'html', 'regex', 'script'
            type: DataTypes.STRING,
            allowNull: false
        },
        extractorFunction: { // For 'script' type, the function body
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
    return ExtractionRule;
};
