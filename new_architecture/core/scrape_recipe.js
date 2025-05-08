// Defines ScrapeRecipe, ExtractionRule, and CanonicalizationRule

/**
 * @typedef {object} ExtractionRule
 * @property {string} selector - CSS selector to find the element.
 * @property {string} type - The type of content to extract (e.g., 'text', 'image', 'table', 'list', 'heading').
 * @property {string} [attribute] - Optional attribute to extract (e.g., 'href' for an <a> tag, 'src' for an <img> tag).
 * @property {boolean} [multiple=false] - Whether to extract multiple elements matching the selector.
 * @property {string} [description] - A human-readable description of what this rule extracts.
 * @property {Array<ExtractionRule>} [children] - Nested extraction rules for complex elements (e.g., extracting rows and cells from a table).
 * @property {string} [metadataField] - If this rule extracts a piece of metadata, this specifies the metadata field name (e.g., 'title', 'author').
 */

/**
 * @typedef {object} CanonicalizationRule
 * @property {string} type - The type of canonicalization to perform (e.g., 'remove_attributes', 'transform_links', 'clean_html', 'format_date').
 * @property {string} [description] - A human-readable description of what this rule does.
 * @property {object} [options] - Rule-specific options.
 * @property {Array<string>} [options.attributesToRemove] - For 'remove_attributes', list of HTML attributes to remove.
 * @property {string} [options.targetDateFormat] - For 'format_date', the desired date format.
 * @property {boolean} [options.removeEmptyTags] - For 'clean_html', whether to remove empty HTML tags.
 */

/**
 * Defines a recipe for scraping content from a specific type of URL or website structure.
 * It includes rules for extracting raw data and then canonicalizing it into a standard format.
 *
 * @typedef {object} ScrapeRecipe
 * @property {string} id - A unique identifier for this recipe.
 * @property {string} name - A human-readable name for the recipe (e.g., "Blog Post Scraper", "Product Page Extractor").
 * @property {string} description - A brief description of what the recipe does or what kind of content it targets.
 * @property {string} version - Version of the recipe (e.g., "1.0.0").
 * @property {Array<string>} urlPatterns - An array of URL patterns (regex or simple wildcards) that this recipe applies to.
 * @property {Array<ExtractionRule>} extractionRules - An array of rules defining how to extract raw content.
 * @property {Array<CanonicalizationRule>} canonicalizationRules - An array of rules defining how to transform extracted content into the canonical format.
 * @property {string} [expectedOutputType="CanonicalDocument"] - The expected output type after processing (e.g., "CanonicalDocument", "JSONSummary").
 * @property {object} [metadata] - Any other relevant metadata about the recipe (e.g., author, creationDate, lastModifiedDate).
 * @property {string} [metadata.author]
 * @property {string} [metadata.creationDate]
 * @property {string} [metadata.lastModifiedDate]
 * @property {boolean} [isActive=true] - Whether the recipe is currently active and usable.
 */