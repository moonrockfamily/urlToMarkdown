// Defines ExtractionRule

/**
 * @typedef {object} ExtractionRule
 * @property {string} id - A unique identifier for this extraction rule.
 * @property {string} selector - CSS selector to find the element.
 * @property {string} type - The type of content to extract (e.g., 'text', 'image', 'table', 'list', 'heading').
 * @property {string} [attribute] - Optional attribute to extract (e.g., 'href' for an <a> tag, 'src' for an <img> tag).
 * @property {boolean} [multiple=false] - Whether to extract multiple elements matching the selector.
 * @property {string} [description] - A human-readable description of what this rule extracts.
 * @property {Array<ExtractionRule>} [children] - Nested extraction rules for complex elements (e.g., extracting rows and cells from a table).
 * @property {string} [metadataField] - If this rule extracts a piece of metadata, this specifies the metadata field name (e.g., 'title', 'author').
 */
class ExtractionRule {
  /**
   * @param {object} params
   * @param {string} params.id - A unique identifier for this extraction rule.
   * @param {string} params.selector - CSS selector.
   * @param {string} params.type - Type of content (e.g., 'text', 'image').
   * @param {string} [params.attribute] - Optional attribute to extract.
   * @param {boolean} [params.multiple=false] - Whether to extract multiple elements.
   * @param {string} [params.description] - Description of the rule.
   * @param {Array<ExtractionRule>} [params.children] - Nested extraction rules.
   * @param {string} [params.metadataField] - Metadata field name.
   */
  constructor({
    id, // Added id parameter
    selector,
    type,
    attribute,
    multiple = false,
    description,
    children = [],
    metadataField
  } = {}) {
    if (!id || !selector || !type) { // Added id to validation
      throw new Error("ExtractionRule requires an 'id', 'selector', and 'type'.");
    }
    this.id = id; // Added id property
    this.selector = selector;
    this.type = type;
    this.attribute = attribute;
    this.multiple = multiple;
    this.description = description;
    // Ensure children are instances of ExtractionRule
    this.children = children.map(childData => childData instanceof ExtractionRule ? childData : new ExtractionRule(childData));
    this.metadataField = metadataField;
  }
}

module.exports = { ExtractionRule };
