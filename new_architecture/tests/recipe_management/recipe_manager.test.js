const RecipeManager = require('../../recipe_management/recipe_manager');
const db = require('../../database/models'); // Import the db object from models/index.js

describe('RecipeManager with Sequelize', () => {
  let recipeManager;

  beforeAll(async () => {
    // Synchronize the database (create tables). `force: true` will drop tables first.
    // This ensures a clean state for each test run if tests are run in sequence.
    // For parallel tests, a separate DB per test file might be needed.
    await db.sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create a new RecipeManager instance for each test to ensure isolation
    recipeManager = new RecipeManager();

    // Clean up database tables before each test to prevent interference
    // Order is important due to foreign key constraints
    await db.ScrapeAssignment.destroy({ where: {}, truncate: true, cascade: true });
    await db.ScrapeRecipe.destroy({ where: {}, truncate: true, cascade: true });
    await db.ExtractionRule.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    // Close the database connection after all tests are done
    await db.sequelize.close();
  });

  describe('ExtractionRule Management', () => {
    test('should add and retrieve an extraction rule', async () => {
      const ruleData = { id: 'rule1', name: 'Extract Titles', selector: 'h1', extractorType: 'text', extractorFunction: 'return textContent;' };
      await recipeManager.addExtractionRule(ruleData);
      const retrievedRule = await recipeManager.getExtractionRuleById('rule1');
      expect(retrievedRule).toBeDefined();
      expect(retrievedRule.id).toBe('rule1');
      expect(retrievedRule.name).toBe('Extract Titles');
    });

    test('getExtractionRuleById should return null for non-existent rule', async () => {
      const retrievedRule = await recipeManager.getExtractionRuleById('nonexistent');
      expect(retrievedRule).toBeNull();
    });

    test('should retrieve all extraction rules', async () => {
      const ruleData1 = { id: 'rule1', name: 'Extract Titles', selector: 'h1', extractorType: 'text' };
      const ruleData2 = { id: 'rule2', name: 'Extract Paragraphs', selector: 'p', extractorType: 'text' };
      await recipeManager.addExtractionRule(ruleData1);
      await recipeManager.addExtractionRule(ruleData2);
      const allRules = await recipeManager.getAllExtractionRules();
      expect(allRules.length).toBe(2);
      expect(allRules).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'rule1' }),
        expect.objectContaining({ id: 'rule2' })
      ]));
    });

    test('getAllExtractionRules should return an empty array if no rules are added', async () => {
      const allRules = await recipeManager.getAllExtractionRules();
      expect(allRules.length).toBe(0);
    });

    test('addExtractionRule should throw an error if rule ID already exists', async () => {
      const ruleData = { id: 'rule1', name: 'Extract Titles', selector: 'h1', extractorType: 'text' };
      await recipeManager.addExtractionRule(ruleData);
      await expect(recipeManager.addExtractionRule(ruleData)).rejects.toThrow('Extraction rule with ID "rule1" already exists.');
    });
  });

  describe('ScrapeRecipe Management', () => {
    let ruleData1, ruleData2;

    beforeEach(async () => {
      ruleData1 = { id: 'rule1', name: 'Extract Titles', selector: 'h1', extractorType: 'text' };
      ruleData2 = { id: 'rule2', name: 'Extract Paragraphs', selector: 'p', extractorType: 'text' };
      await recipeManager.addExtractionRule(ruleData1);
      await recipeManager.addExtractionRule(ruleData2);
    });

    test('should add and retrieve a scrape recipe', async () => {
      const recipeData = {
        id: 'recipe1',
        name: 'Test Recipe',
        extractionRuleIds: ['rule1'],
        canonicalizationRuleIds: [{ id: 'canon1', name: 'Clean HTML', functionBody: 'return cleanedHtml;' }],
        sourceUrl: 'http://example.com',
        version: 'v1.0'
      };
      await recipeManager.addRecipe(recipeData);
      const retrievedRecipe = await recipeManager.getRecipeById('recipe1');
      expect(retrievedRecipe).toBeDefined();
      expect(retrievedRecipe.id).toBe('recipe1');
      expect(retrievedRecipe.name).toBe('Test Recipe');
      expect(retrievedRecipe.extractionRuleIds).toEqual(['rule1']);
      expect(retrievedRecipe.canonicalizationRuleIds).toEqual([{ id: 'canon1', name: 'Clean HTML', functionBody: 'return cleanedHtml;' }]);
    });

    test('getRecipeById should return null for non-existent recipe', async () => {
      const retrievedRecipe = await recipeManager.getRecipeById('nonexistent');
      expect(retrievedRecipe).toBeNull();
    });

    test('should retrieve all scrape recipes', async () => {
      const recipeData1 = { id: 'recipe1', name: 'Test Recipe 1', extractionRuleIds: ['rule1'] };
      const recipeData2 = { id: 'recipe2', name: 'Test Recipe 2', extractionRuleIds: ['rule2'] };
      await recipeManager.addRecipe(recipeData1);
      await recipeManager.addRecipe(recipeData2);
      const allRecipes = await recipeManager.getAllRecipes();
      expect(allRecipes.length).toBe(2);
      expect(allRecipes).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'recipe1' }),
        expect.objectContaining({ id: 'recipe2' })
      ]));
    });

    test('getAllRecipes should return an empty array if no recipes are added', async () => {
      const allRecipes = await recipeManager.getAllRecipes();
      expect(allRecipes.length).toBe(0);
    });

    test('getFullRecipeDetails should retrieve a recipe with populated extraction rules', async () => {
      const recipeData = { id: 'recipe1', name: 'Test Recipe', extractionRuleIds: ['rule1', 'rule2'] };
      await recipeManager.addRecipe(recipeData);
      const fullDetails = await recipeManager.getFullRecipeDetails('recipe1');
      expect(fullDetails).toBeDefined();
      expect(fullDetails.recipe.id).toBe('recipe1');
      expect(fullDetails.extractionRules.length).toBe(2);
      expect(fullDetails.extractionRules).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'rule1' }),
        expect.objectContaining({ id: 'rule2' })
      ]));
    });

    test('getFullRecipeDetails should return null if recipe does not exist', async () => {
      const fullDetails = await recipeManager.getFullRecipeDetails('nonexistent');
      expect(fullDetails).toBeNull();
    });

    test('getFullRecipeDetails should handle recipes with non-existent extraction rule IDs gracefully', async () => {
      const recipeData = { id: 'recipe1', name: 'Test Recipe', extractionRuleIds: ['rule1', 'nonexistentRule'] };
      await recipeManager.addRecipe(recipeData);
      const fullDetails = await recipeManager.getFullRecipeDetails('recipe1');
      expect(fullDetails).toBeDefined();
      expect(fullDetails.recipe.id).toBe('recipe1');
      expect(fullDetails.extractionRules.length).toBe(1);
      expect(fullDetails.extractionRules[0].id).toBe('rule1');
    });
  });

  describe('ScrapeAssignment Management', () => {
    let recipeData1;
    beforeEach(async () => {
        recipeData1 = { id: 'recipe1', name: 'R1', extractionRuleIds: [] };
        await recipeManager.addRecipe(recipeData1);
    });

    test('should add and retrieve a scrape assignment', async () => {
      const assignmentData = { id: 'assign1', targetUrl: 'https://example.com/*', recipeId: 'recipe1' }; // Changed urlPattern to targetUrl
      await recipeManager.addScrapeAssignment(assignmentData);
      const retrievedAssignment = await recipeManager.getScrapeAssignmentById('assign1');
      expect(retrievedAssignment).toBeDefined();
      expect(retrievedAssignment.id).toBe('assign1');
      expect(retrievedAssignment.recipeId).toBe('recipe1');
    });

    test('getScrapeAssignmentById should return null for non-existent assignment', async () => {
      const retrievedAssignment = await recipeManager.getScrapeAssignmentById('nonexistent');
      expect(retrievedAssignment).toBeNull();
    });

    test('should retrieve all scrape assignments', async () => {
      const recipeData2 = { id: 'recipe2', name: 'R2', extractionRuleIds: [] };
      await recipeManager.addRecipe(recipeData2);

      const assignmentData1 = { id: 'assign1', targetUrl: 'https://example.com/*', recipeId: 'recipe1' };
      const assignmentData2 = { id: 'assign2', targetUrl: 'https://another.com/*', recipeId: 'recipe2' };
      await recipeManager.addScrapeAssignment(assignmentData1);
      await recipeManager.addScrapeAssignment(assignmentData2);
      const allAssignments = await recipeManager.getAllScrapeAssignments();
      expect(allAssignments.length).toBe(2);
      expect(allAssignments).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'assign1' }),
        expect.objectContaining({ id: 'assign2' })
      ]));
    });

    test('getAllScrapeAssignments should return an empty array if no assignments are added', async () => {
      const allAssignments = await recipeManager.getAllScrapeAssignments();
      expect(allAssignments.length).toBe(0);
    });

    test('addScrapeAssignment should throw error if recipeId does not exist', async () => {
        const assignmentData = { id: 'assignNew', targetUrl: 'http://test.com', recipeId: 'nonExistentRecipe' };
        await expect(recipeManager.addScrapeAssignment(assignmentData))
            .rejects.toThrow('Cannot add scrape assignment: Recipe with ID "nonExistentRecipe" does not exist.');
    });
  });

  describe('URL-based Recipe Finding', () => {
    let ruleData1, recipeData1, assignmentData1;

    beforeEach(async () => {
      ruleData1 = { id: 'rule1', name: 'Extract Titles', selector: 'h1', extractorType: 'text' };
      await recipeManager.addExtractionRule(ruleData1);

      recipeData1 = { 
        id: 'recipe1', 
        name: 'Test Recipe', 
        extractionRuleIds: ['rule1'], 
        canonicalizationRuleIds: [{id: 'canon1', name: 'Clean HTML'}] 
      };
      await recipeManager.addRecipe(recipeData1);

      assignmentData1 = { id: 'assign1', targetUrl: 'https://example.com/page', recipeId: 'recipe1', isActive: true };
      await recipeManager.addScrapeAssignment(assignmentData1);
    });

    test('findRecipeForUrl should return the correct recipe for a matching URL', async () => {
      const foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/page');
      expect(foundRecipe).toBeDefined();
      expect(foundRecipe.id).toBe('recipe1');
    });

    test('findRecipeForUrl should return null for a non-matching URL', async () => {
      const foundRecipe = await recipeManager.findRecipeForUrl('https://nonexistent.com');
      expect(foundRecipe).toBeNull();
    });

    test('findRecipeForUrl should handle wildcard patterns', async () => {
      const assignmentData2 = { id: 'assign2', targetUrl: 'https://*.example.org/*', recipeId: 'recipe1', isActive: true };
      await recipeManager.addScrapeAssignment(assignmentData2);
      const foundRecipe = await recipeManager.findRecipeForUrl('https://sub.example.org/some/path');
      expect(foundRecipe).toBeDefined();
      expect(foundRecipe.id).toBe('recipe1');
    });

    test('findRecipeForUrl should return null if no assignments match', async () => {
      // Clear assignments made in beforeEach for this specific test
      await db.ScrapeAssignment.destroy({ where: {}, truncate: true });
      const foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/page');
      expect(foundRecipe).toBeNull();
    });

    test('findFullRecipeForUrl should return the full recipe details for a matching URL', async () => {
      const fullDetails = await recipeManager.findFullRecipeForUrl('https://example.com/page');
      expect(fullDetails).toBeDefined();
      expect(fullDetails.recipe.id).toBe('recipe1');
      expect(fullDetails.extractionRules.length).toBe(1);
      expect(fullDetails.extractionRules[0].id).toBe('rule1');
      expect(fullDetails.recipe.canonicalizationRuleIds).toEqual([{id: 'canon1', name: 'Clean HTML'}]);
    });

    test('findFullRecipeForUrl should return null for a non-matching URL', async () => {
      const fullDetails = await recipeManager.findFullRecipeForUrl('https://nonexistent.com');
      expect(fullDetails).toBeNull();
    });

    test('findFullRecipeForUrl should return details with empty extractionRules if a recipe is found but an extraction rule is missing', async () => {
      const recipeData2 = { id: 'recipe2', name: 'Recipe With Missing Rule', extractionRuleIds: ['nonexistentRuleId'] };
      await recipeManager.addRecipe(recipeData2);
      const assignmentData2 = { id: 'assign2', targetUrl: 'https://test.com', recipeId: 'recipe2', isActive: true };
      await recipeManager.addScrapeAssignment(assignmentData2);

      const fullDetails = await recipeManager.findFullRecipeForUrl('https://test.com');
      expect(fullDetails).toBeDefined();
      expect(fullDetails.recipe.id).toBe('recipe2');
      expect(fullDetails.extractionRules.length).toBe(0);
    });

    test('findRecipeForUrl should prioritize exact matches over wildcards, and consider assignment order if patterns are similar', async () => {
      const recipeData2 = { id: 'recipe2', name: 'Specific Recipe', extractionRuleIds: [] };
      await recipeManager.addRecipe(recipeData2);
      const recipeData3 = { id: 'recipe3', name: 'Wildcard Recipe', extractionRuleIds: [] };
      await recipeManager.addRecipe(recipeData3);

      // assignmentData1 (exact for /page) already exists from beforeEach -> recipe1

      // More specific assignment (longer path)
      const assignmentSpecific = { id: 'assignSpecific', targetUrl: 'https://example.com/page/specific', recipeId: 'recipe2', isActive: true };
      await recipeManager.addScrapeAssignment(assignmentSpecific);

      // Generic wildcard assignment for the domain
      const assignmentWildcard = { id: 'assignWild', targetUrl: 'https://example.com/*', recipeId: 'recipe3', isActive: true };
      await recipeManager.addScrapeAssignment(assignmentWildcard);
      
      // To ensure order of retrieval from DB doesn't affect logic if not explicitly ordered in RecipeManager query,
      // we rely on the matching logic itself. Current logic iterates and first match wins.
      // If specific ordering of assignments (e.g. by length or priority field) is needed, RecipeManager.findRecipeForUrl query needs `order` clause.

      let foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/page/specific');
      expect(foundRecipe.id).toBe('recipe2'); // Most specific path

      foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/page');
      expect(foundRecipe.id).toBe('recipe1'); // Exact match for /page

      foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/another');
      expect(foundRecipe.id).toBe('recipe3'); // Wildcard match
    });

    test('findRecipeForUrl should not match inactive assignments', async () => {
      const recipeData4 = { id: 'recipe4', name: 'Inactive Recipe', extractionRuleIds: [] };
      await recipeManager.addRecipe(recipeData4);
      const assignmentInactive = { id: 'assignInactive', targetUrl: 'https://example.com/inactive', recipeId: 'recipe4', isActive: false };
      await recipeManager.addScrapeAssignment(assignmentInactive);

      const foundRecipe = await recipeManager.findRecipeForUrl('https://example.com/inactive');
      expect(foundRecipe).toBeNull(); // Should not find it because it's inactive
    });

  });
});
