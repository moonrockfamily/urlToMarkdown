// Defines RawExtractedItem

/**
 * Represents a single piece of data extracted directly from a source, before any canonicalization.
 * This structure is intended to be flexible to accommodate various types of raw data
 * that might be extracted (e.g., text, image URLs, table data, etc.).
 *
 * @typedef {object} RawExtractedItem
 * @property {string} type - The type of content extracted (e.g., 'text', 'image', 'table', 'list_item', 'heading', 'video', 'audio', 'code_block', 'blockquote', 'horizontal_rule', 'metadata').
 * @property {object} [data] - The actual extracted data. The structure of this object will vary based on the 'type'.
 * @property {string} [data.text] - Text content (for type 'text', 'list_item', 'heading', 'blockquote').
 * @property {string} [data.url] - URL for 'image', 'video', 'audio'.
 * @property {string} [data.altText] - Alternative text for an image.
 * @property {string} [data.caption] - Caption for an image, video, or table.
 * @property {Array<Array<string>>} [data.rows] - For 'table' type, an array of rows, where each row is an array of cell strings.
 * @property {boolean} [data.isHeader] - For 'table' type, indicates if a row is a header row. (Often, the first row is a header).
 * @property {number} [data.level] - For 'heading' type (e.g., 1 for <h1>, 2 for <h2>). For 'list_item', the indentation level.
 * @property {string} [data.language] - For 'code_block' type, the programming language.
 * @property {string} [data.code] - For 'code_block' type, the code content.
 * @property {string} [data.ordered] - For 'list_item' that is part of an ordered list, the marker (e.g., '1.', 'a.'). Null if unordered.
 * @property {string} [data.metaName] - For 'metadata' type, the name of the metadata (e.g., 'author', 'publishDate', 'title').
 * @property {string} [data.metaValue] - For 'metadata' type, the value of the metadata.
 * @property {string} [sourceUrl] - The URL from which this item was extracted.
 * @property {string} [selector] - The CSS selector or XPath used to extract this item, if applicable.
 * @property {number} [order] - The original order of this item as it appeared on the source page/document.
 * @property {object} [attributes] - Any other relevant HTML attributes or source-specific properties.
 * @property {Array<RawExtractedItem>} [children] - For nested structures like nested lists.
 */