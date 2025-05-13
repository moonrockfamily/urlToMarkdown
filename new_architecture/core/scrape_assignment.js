// Defines ScrapeAssignment

/**
 * Represents an assignment of a ScrapeRecipe to specific URL patterns.
 *
 * @typedef {object} ScrapeAssignment
 * @property {string} id - A unique identifier for this assignment.
 * @property {string} name - A human-readable name for this assignment (e.g., "Assign Blog Post Recipe to /blog/.*").
 * @property {Array<string>} urlPatterns - An array of URL patterns (regex or simple wildcards) that this assignment applies to.
 * @property {string} recipeId - The ID of the ScrapeRecipe to be used for these URL patterns.
 * @property {number} [priority=0] - Optional priority for the assignment, lower numbers indicate higher priority. Used when multiple assignments might match a URL.
 * @property {boolean} [isActive=true] - Whether the assignment is currently active and usable.
 * @property {string} [description] - A brief description of what this assignment does.
 */
class ScrapeAssignment {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {Array<string>} params.urlPatterns
   * @param {string} params.recipeId
   * @param {number} [params.priority=0]
   * @param {boolean} [params.isActive=true]
   * @param {string} [params.description]
   */
  constructor({
    id,
    name,
    urlPatterns,
    recipeId,
    priority = 0,
    isActive = true,
    description
  }) {
    if (!id || !name || !urlPatterns || urlPatterns.length === 0 || !recipeId) {
      throw new Error("ScrapeAssignment requires an 'id', 'name', at least one 'urlPattern', and a 'recipeId'.");
    }
    this.id = id;
    this.name = name;
    this.urlPatterns = urlPatterns;
    this.recipeId = recipeId;
    this.priority = priority;
    this.isActive = isActive;
    this.description = description;
  }
}

module.exports = { ScrapeAssignment };
