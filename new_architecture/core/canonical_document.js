// Defines CanonicalDocument, Section, CanonicalBlock, ImageResource

/**
 * @typedef {object} DocumentMetadata
 * @property {string} [title] - The main title of the document.
 * @property {string} [sourceUrl] - The original URL from which the content was scraped.
 * @property {string} [author] - The author of the document, if known.
 * @property {string} [dateScraped] - ISO date string of when the content was scraped.
 * @property {string} [publicationDate] - ISO date string of when the content was originally published, if known.
 * @property {object<string, any>} [additionalProperties] - For any other metadata.
 */

/**
 * @typedef {object} ImageResource
 * @property {string} id - A unique identifier for this image resource within the document.
 * @property {string} originalUrl - The original URL of the image.
 * @property {string} [resolvedUrl] - The URL where the image is stored/accessible after processing (e.g., local path or data URI).
 * @property {string} [altText] - Alternative text for the image.
 * @property {string} [format] - The image format (e.g., 'png', 'jpeg').
 * @property {number} [width] - Width of the image in pixels.
 * @property {number} [height] - Height of the image in pixels.
 */

/**
 * Represents a fundamental content block within a document section.
 * @typedef {object} CanonicalBlock
 * @property {string} blockId - A unique identifier for this block within the document.
 * @property {'PARAGRAPH'|'HEADER'|'UL'|'OL'|'LI'|'IMAGE_REFERENCE'|'TABLE'|'TEXT_CONTENT'|'QUOTE'|'CODE_BLOCK'|'HORIZONTAL_RULE'|'CUSTOM'} type - The type of the content block.
 * @property {string} [text] - Text content, primarily for PARAGRAPH, HEADER, TEXT_CONTENT, QUOTE.
 * @property {number} [level] - Header level (1-6) if type is HEADER.
 * @property {Array<CanonicalBlock|string>} [children] - Child blocks, typically for list items (LI containing other blocks or text), or list containers (UL/OL containing LIs). For simple text LIs, children might be an array of TEXT_CONTENT blocks or strings.
 * @property {string} [resourceId] - Identifier linking to an ImageResource if type is IMAGE_REFERENCE.
 * @property {string} [src] - Fallback src for an image if resourceId is not used or resolvable.
 * @property {string} [altText] - Alt text, primarily for IMAGE_REFERENCE.
 * @property {string} [caption] - Caption, primarily for IMAGE_REFERENCE or TABLE.
 * @property {Array<string>} [headers] - Array of header cell contents if type is TABLE.
 * @property {Array<Array<string>>} [rows] - Array of rows, where each row is an array of cell contents, if type is TABLE.
 * @property {string} [language] - Language for a CODE_BLOCK.
 * @property {string} [attribution] - Attribution for a QUOTE.
 * @property {object<string, any>} [customProperties] - For 'CUSTOM' block types or extending existing types.
 */

/**
 * Represents a section of a document, which can optionally have a header
 * and contains multiple content blocks.
 * @typedef {object} Section
 * @property {string} sectionId - A unique identifier for this section.
 * @property {string} [header] - The title or header for this section.
 * @property {Array<CanonicalBlock>} contentBlocks - An array of CanonicalBlock objects representing the content of this section.
 */

/**
 * Represents the entire scraped and processed document in a standardized format.
 * @typedef {object} CanonicalDocument
 * @property {DocumentMetadata} documentMetadata - Metadata associated with the document.
 * @property {Array<ImageResource>} imageResources - A list of all image resources referenced in the document.
 * @property {Array<Section>} sections - An array of Section objects that make up the document structure.
 * @property {string} [version] - Version of the CanonicalDocument schema. Default: "1.0.0"
 */

// Example of how you might export or use these (optional, as JSDoc types are globally available for documentation)
// These are not actual class instantiations but placeholders for type referencing if needed by some tools.
module.exports = {
  /** @type {DocumentMetadata} */
  DocumentMetadata: { title: undefined, sourceUrl: undefined, author: undefined, dateScraped: undefined, publicationDate: undefined, additionalProperties: {} },
  /** @type {ImageResource} */
  ImageResource: { id: '', originalUrl: '', resolvedUrl: undefined, altText: undefined, format: undefined, width: undefined, height: undefined },
  /** @type {CanonicalBlock} */
  CanonicalBlock: { blockId: '', type: 'PARAGRAPH', text: undefined, level: undefined, children: [], resourceId: undefined, src: undefined, altText: undefined, caption: undefined, headers: [], rows: [], language: undefined, attribution: undefined, customProperties: {} },
  /** @type {Section} */
  Section: { sectionId: '', header: undefined, contentBlocks: [] },
  /** @type {CanonicalDocument} */
  CanonicalDocument: { documentMetadata: {}, imageResources: [], sections: [], version: '1.0.0' }
};
