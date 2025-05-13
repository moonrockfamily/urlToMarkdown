// Manages the lifecycle of ScrapeRecipe, ScrapeAssignment, and ExtractionRule objects

const db = require('../database/models'); // Corrected path: Imports from models/index.js
// const { ScrapeRecipe } = require('../core/scrape_recipe'); // Core classes can be used for type hinting or data shaping if needed
// const { ScrapeAssignment } = require('../core/scrape_assignment');
// const { ExtractionRule } = require('../core/extraction_rule');

class RecipeManager {
    constructor() {
        // No more in-memory maps
    }

    /**
     * Adds a new scrape recipe.
     * @param {object} recipeData - Data for the new ScrapeRecipe.
     * @returns {Promise<db.ScrapeRecipe>}
     * @throws {Error} If recipeData is invalid or ID already exists.
     */
    async addRecipe(recipeData) {
        if (!recipeData || !recipeData.id || !recipeData.name) {
            throw new Error('Invalid recipe data provided. ID and name are required.');
        }
        const existingRecipe = await db.ScrapeRecipe.findByPk(recipeData.id);
        if (existingRecipe) {
            throw new Error(`Recipe with ID "${recipeData.id}" already exists.`);
        }
        return db.ScrapeRecipe.create(recipeData);
    }

    /**
     * Retrieves a recipe by its ID.
     * @param {string} recipeId - The ID of the recipe to retrieve.
     * @returns {Promise<db.ScrapeRecipe | null>}
     */
    async getRecipeById(recipeId) {
        return db.ScrapeRecipe.findByPk(recipeId);
    }

    /**
     * Retrieves all recipes.
     * @returns {Promise<Array<db.ScrapeRecipe>>}
     */
    async getAllRecipes() {
        return db.ScrapeRecipe.findAll();
    }

    /**
     * Adds a new extraction rule.
     * @param {object} ruleData - Data for the new ExtractionRule.
     * @returns {Promise<db.ExtractionRule>}
     * @throws {Error} If ruleData is invalid or ID already exists.
     */
    async addExtractionRule(ruleData) {
        if (!ruleData || !ruleData.id || !ruleData.name || !ruleData.selector || !ruleData.extractorType) {
            throw new Error('Invalid extraction rule data. ID, name, selector, and extractorType are required.');
        }
        const existingRule = await db.ExtractionRule.findByPk(ruleData.id);
        if (existingRule) {
            throw new Error(`Extraction rule with ID "${ruleData.id}" already exists.`);
        }
        return db.ExtractionRule.create(ruleData);
    }

    /**
     * Retrieves an extraction rule by its ID.
     * @param {string} ruleId - The ID of the extraction rule.
     * @returns {Promise<db.ExtractionRule | null>}
     */
    async getExtractionRuleById(ruleId) {
        return db.ExtractionRule.findByPk(ruleId);
    }

    /**
     * Retrieves all extraction rules.
     * @returns {Promise<Array<db.ExtractionRule>>}
     */
    async getAllExtractionRules() {
        return db.ExtractionRule.findAll();
    }

    /**
     * Adds a new scrape assignment.
     * @param {object} assignmentData - Data for the new ScrapeAssignment.
     *                                   Requires id, recipeId, targetUrl.
     * @returns {Promise<db.ScrapeAssignment>}
     * @throws {Error} If assignmentData is invalid, ID already exists, or associated recipeId does not exist.
     */
    async addScrapeAssignment(assignmentData) {
        if (!assignmentData || !assignmentData.id || !assignmentData.recipeId || !assignmentData.targetUrl) {
            throw new Error('Invalid scrape assignment data. ID, recipeId, and targetUrl are required.');
        }

        const existingAssignment = await db.ScrapeAssignment.findByPk(assignmentData.id);
        if (existingAssignment) {
            throw new Error(`Scrape assignment with ID "${assignmentData.id}" already exists.`);
        }

        const recipeExists = await db.ScrapeRecipe.findByPk(assignmentData.recipeId);
        if (!recipeExists) {
            throw new Error(`Cannot add scrape assignment: Recipe with ID "${assignmentData.recipeId}" does not exist.`);
        }

        return db.ScrapeAssignment.create(assignmentData);
    }

    /**
     * Retrieves a scrape assignment by its ID.
     * @param {string} assignmentId - The ID of the scrape assignment.
     * @returns {Promise<db.ScrapeAssignment | null>}
     */
    async getScrapeAssignmentById(assignmentId) {
        return db.ScrapeAssignment.findByPk(assignmentId);
    }

    /**
     * Retrieves all scrape assignments.
     * @returns {Promise<Array<db.ScrapeAssignment>>}
     */
    async getAllScrapeAssignments() {
        return db.ScrapeAssignment.findAll();
    }

    /**
     * Finds a recipe that matches the given URL based on ScrapeAssignments.
     * @param {string} url - The URL to find a recipe for.
     * @returns {Promise<db.ScrapeRecipe | null>} The matched ScrapeRecipe, or null if no match is found.
     */
    async findRecipeForUrl(url) {
        const assignments = await db.ScrapeAssignment.findAll({
            where: { isActive: true },
            // Order by specificity or a priority field if needed in the future
        });

        for (const assignment of assignments) {
            const pattern = assignment.targetUrl; // Using targetUrl from Sequelize model
            if (pattern === '*') {
                return db.ScrapeRecipe.findByPk(assignment.recipeId);
            }
            if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*?');
                const regex = new RegExp(`^${regexPattern}$`);
                if (regex.test(url)) {
                    return db.ScrapeRecipe.findByPk(assignment.recipeId);
                }
            } else if (url === pattern) {
                return db.ScrapeRecipe.findByPk(assignment.recipeId);
            }
        }
        return null;
    }

    /**
     * Retrieves a full ScrapeRecipe along with its populated ExtractionRule objects.
     * @param {string} recipeId - The ID of the recipe.
     * @returns {Promise<{recipe: db.ScrapeRecipe, extractionRules: Array<db.ExtractionRule>} | null>}
     */
    async getFullRecipeDetails(recipeId) {
        const recipe = await db.ScrapeRecipe.findByPk(recipeId);
        if (!recipe) {
            return null;
        }

        let extractionRules = [];
        if (recipe.extractionRuleIds && recipe.extractionRuleIds.length > 0) {
            extractionRules = await db.ExtractionRule.findAll({
                where: {
                    id: recipe.extractionRuleIds // Sequelize can take an array for an IN query
                }
            });
        }
        return { recipe, extractionRules };
    }

    /**
     * Finds a full ScrapeRecipe (with populated ExtractionRules) that matches the given URL.
     * @param {string} url - The URL to find a recipe for.
     * @returns {Promise<{recipe: db.ScrapeRecipe, extractionRules: Array<db.ExtractionRule>} | null>}
     */
    async findFullRecipeForUrl(url) {
        const recipe = await this.findRecipeForUrl(url);
        if (recipe) {
            return this.getFullRecipeDetails(recipe.id);
        }
        return null;
    }
}

module.exports = RecipeManager; // Export the class, not an instance
