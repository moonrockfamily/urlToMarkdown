const db = require('./models'); // Imports from models/index.js

/**
 * Initializes the database, creates tables if they don't exist.
 * @async
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    try {
        // The { force: true } option will drop the table if it already exists.
        // Use with caution, especially in production.
        // For development, it can be useful to clear out tables on restart.
        // await db.sequelize.sync({ force: true }); // To drop and recreate tables
        await db.sequelize.sync(); // Ensures tables are created if they don't exist
        console.log('Database synchronized successfully.');

        // You can add any initial data seeding here if necessary
        // For example:
        // if (process.env.NODE_ENV !== 'production') {
        //     await seedDatabase();
        // }

    } catch (error) {
        console.error('Failed to synchronize database:', error);
        throw error; // Re-throw to indicate initialization failure
    }
}

/**
 * Optional: A function to seed the database with initial data.
 * @async
 */
// async function seedDatabase() {
//     try {
//         // Example: Create a default ScrapeRecipe if it doesn't exist
//         const [recipe, created] = await db.ScrapeRecipe.findOrCreate({
//             where: { id: 'default-recipe' },
//             defaults: {
//                 name: 'Default Recipe',
//                 description: 'A general purpose recipe.',
//                 sourceUrl: 'http://example.com'
//             }
//         });
//         if (created) {
//             console.log('Default recipe created.');
//         }
//     } catch (error) {
//         console.error('Error seeding database:', error);
//     }
// }

module.exports = {
    db, // Export the db object (which includes sequelize instance and models)
    initializeDatabase
};
