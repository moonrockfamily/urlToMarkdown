// filepath: c:\Users\thiles\gitrepo\urlToMarkdown\new_architecture\database\models\index.js
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Initialize Sequelize with SQLite
// For testing, you might use an in-memory SQLite database:
// const sequelize = new Sequelize('sqlite::memory:');
// For a persistent database:
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'app_database.sqlite'), // Store it in the database directory
    logging: false, // Set to console.log to see SQL queries
});

const db = {};

// Read all model files from the current directory (excluding index.js)
fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-9) === '.model.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// Define associations
if (db.ScrapeRecipe && db.ExtractionRule) {
    // A ScrapeRecipe can have many ExtractionRules (though we store IDs, this defines the potential)
    // If we were to store ExtractionRules as separate associated entities rather than just IDs:
    // db.ScrapeRecipe.hasMany(db.ExtractionRule, { as: 'rules' });
    // db.ExtractionRule.belongsTo(db.ScrapeRecipe);
    // For now, we are managing relationships via arrays of IDs in ScrapeRecipe.
    // If direct Sequelize associations are needed later for complex queries, these can be uncommented
    // and the ScrapeRecipe model adjusted (e.g., removing extractionRuleIds).
}

if (db.ScrapeRecipe && db.ScrapeAssignment) {
    db.ScrapeRecipe.hasMany(db.ScrapeAssignment, {
        foreignKey: 'recipeId',
        as: 'assignments'
    });
    db.ScrapeAssignment.belongsTo(db.ScrapeRecipe, {
        foreignKey: 'recipeId',
        as: 'recipe'
    });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
