// Defines ScrapeRecipe

// const { ExtractionRule } = require('./extraction_rule'); // No longer directly embedding ExtractionRule instances
const { CanonicalizationRule } = require('./canonicalization_rule');

/**
 * Defines a recipe for scraping content from a specific type of URL or website structure.
 * It includes rules for extracting raw data and then canonicalizing it into a standard format.
 *
 * @typedef {object} ScrapeRecipe
 * @property {string} id - A unique identifier for this recipe.
 * @property {string} name - A human-readable name for the recipe (e.g., "Blog Post Scraper", "Product Page Extractor").
 * @property {string} description - A brief description of what the recipe does or what kind of content it targets.
 * @property {string} version - Version of the recipe (e.g., "1.0.0").
 * @property {Array<string>} extractionRuleIds - An array of ExtractionRule IDs defining how to extract raw content.
 * @property {Array<CanonicalizationRule>} canonicalizationRules - An array of rules defining how to transform extracted content into the canonical format.
 * @property {string} [expectedOutputType="CanonicalDocument"] - The expected output type after processing (e.g., "CanonicalDocument", "JSONSummary").
 * @property {object} [metadata] - Any other relevant metadata about the recipe (e.g., author, creationDate, lastModifiedDate).
 * @property {string} [metadata.author]
 * @property {string} [metadata.creationDate]
 * @property {string} [metadata.lastModifiedDate]
 * @property {boolean} [isActive=true] - Whether the recipe is currently active and usable.
 */
class ScrapeRecipe {
  /**
   * @param {object} params
   * @param {string} params.id - Unique ID for the recipe.
   * @param {string} params.name - Human-readable name.
   * @param {string} params.description - Description of the recipe.
   * @param {string} [params.version="1.0.0"] - Recipe version.
   * @param {Array<string>} [params.extractionRuleIds] - Array of ExtractionRule IDs.
   * @param {Array<CanonicalizationRule>} [params.canonicalizationRules] - Rules for transforming content.
   * @param {string} [params.expectedOutputType="CanonicalDocument"] - Expected output type.
   * @param {object} [params.metadata] - Other metadata (author, creationDate, etc.).
   * @param {boolean} [params.isActive=true] - Whether the recipe is active.
   */
  constructor({
    id,
    name,
    description,
    version = "1.0.0",
    extractionRuleIds = [], // Changed from extractionRules to extractionRuleIds
    canonicalizationRules = [],
    expectedOutputType = "CanonicalDocument",
    metadata = {},
    isActive = true
  }) {
    if (!id || !name /* || !urlPatterns || urlPatterns.length === 0 */) { // Removed urlPatterns from validation
      throw new Error("ScrapeRecipe requires an 'id' and 'name'."); // Updated error message
    }
    this.id = id;
    this.name = name;
    this.description = description;
    this.version = version;
    // this.urlPatterns = urlPatterns; // Removed urlPatterns
    this.extractionRuleIds = extractionRuleIds; // Changed from extractionRules
    this.canonicalizationRules = canonicalizationRules.map(ruleData => ruleData instanceof CanonicalizationRule ? ruleData : new CanonicalizationRule(ruleData));
    this.expectedOutputType = expectedOutputType;
    this.metadata = metadata;
    this.isActive = isActive;
  }
}

module.exports = { ScrapeRecipe };