// Defines CanonicalizationRule

/**
 * @typedef {object} CanonicalizationRule
 * @property {string} type - The type of canonicalization to perform (e.g., 'remove_attributes', 'transform_links', 'clean_html', 'format_date').
 * @property {string} [description] - A human-readable description of what this rule does.
 * @property {object} [options] - Rule-specific options.
 * @property {Array<string>} [options.attributesToRemove] - For 'remove_attributes', list of HTML attributes to remove.
 * @property {string} [options.targetDateFormat] - For 'format_date', the desired date format.
 * @property {boolean} [options.removeEmptyTags] - For 'clean_html', whether to remove empty HTML tags.
 */
class CanonicalizationRule {
  /**
   * @param {object} params
   * @param {string} params.type - Type of canonicalization (e.g., 'remove_attributes').
   * @param {string} [params.description] - Description of the rule.
   * @param {object} [params.options] - Rule-specific options.
   */
  constructor({ type, description, options = {} } = {}) {
    if (!type) {
      throw new Error("CanonicalizationRule requires a 'type'.");
    }
    this.type = type;
    this.description = description;
    this.options = options;
  }
}

module.exports = { CanonicalizationRule };
