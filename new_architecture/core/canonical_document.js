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

class DocumentMetadata {
  /**
   * @param {object} params
   * @param {string} [params.title]
   * @param {string} [params.sourceUrl]
   * @param {string} [params.author]
   * @param {string} [params.dateScraped]
   * @param {string} [params.publicationDate]
   * @param {object<string, any>} [params.additionalProperties]
   */
  constructor({ title, sourceUrl, author, dateScraped, publicationDate, additionalProperties = {} } = {}) {
    this.title = title;
    this.sourceUrl = sourceUrl;
    this.author = author;
    this.dateScraped = dateScraped;
    this.publicationDate = publicationDate;
    this.additionalProperties = additionalProperties;
  }
}

class ImageResource {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.originalUrl
   * @param {string} [params.resolvedUrl]
   * @param {string} [params.altText]
   * @param {string} [params.format]
   * @param {number} [params.width]
   * @param {number} [params.height]
   */
  constructor({ id, originalUrl, resolvedUrl, altText, format, width, height } = {}) {
    if (!id || !originalUrl) {
      throw new Error("ImageResource requires an 'id' and 'originalUrl'.");
    }
    this.id = id;
    this.originalUrl = originalUrl;
    this.resolvedUrl = resolvedUrl;
    this.altText = altText;
    this.format = format;
    this.width = width;
    this.height = height;
  }
}

class CanonicalBlock {
  /**
   * @param {object} params
   * @param {string} params.blockId
   * @param {'PARAGRAPH'|'HEADER'|'UL'|'OL'|'LI'|'IMAGE_REFERENCE'|'TABLE'|'TEXT_CONTENT'|'QUOTE'|'CODE_BLOCK'|'HORIZONTAL_RULE'|'CUSTOM'} params.type
   * @param {string} [params.text]
   * @param {number} [params.level]
   * @param {Array<CanonicalBlock|string>} [params.children]
   * @param {string} [params.resourceId]
   * @param {string} [params.src]
   * @param {string} [params.altText]
   * @param {string} [params.caption]
   * @param {Array<string>} [params.headers]
   * @param {Array<Array<string>>} [params.rows]
   * @param {string} [params.language]
   * @param {string} [params.attribution]
   * @param {object<string, any>} [params.customProperties]
   */
  constructor({
    blockId,
    type,
    text,
    level,
    children = [],
    resourceId,
    src,
    altText,
    caption,
    headers = [],
    rows = [],
    language,
    attribution,
    customProperties = {}
  } = {}) {
    if (!blockId || !type) {
      throw new Error("CanonicalBlock requires a 'blockId' and 'type'.");
    }
    this.blockId = blockId;
    this.type = type;
    this.text = text;
    this.level = level;
    this.children = children; // Should be an array of CanonicalBlock instances or strings
    this.resourceId = resourceId;
    this.src = src;
    this.altText = altText;
    this.caption = caption;
    this.headers = headers; // For TABLE type
    this.rows = rows; // For TABLE type, array of arrays of strings
    this.language = language; // For CODE_BLOCK
    this.attribution = attribution; // For QUOTE
    this.customProperties = customProperties; // For CUSTOM or extending types
  }
}

class Section {
  /**
   * @param {object} params
   * @param {string} params.sectionId
   * @param {string} [params.header]
   * @param {Array<CanonicalBlock>} [params.contentBlocks]
   */
  constructor({ sectionId, header, contentBlocks = [] } = {}) {
    if (!sectionId) {
      throw new Error("Section requires a 'sectionId'.");
    }
    this.sectionId = sectionId;
    this.header = header;
    this.contentBlocks = contentBlocks; // Should be an array of CanonicalBlock instances
  }
}

class CanonicalDocument {
  /**
   * @param {object} params
   * @param {DocumentMetadata} [params.documentMetadata]
   * @param {Array<ImageResource>} [params.imageResources]
   * @param {Array<Section>} [params.sections]
   * @param {string} [params.version]
   */
  constructor({ documentMetadata = new DocumentMetadata(), imageResources = [], sections = [], version = "1.0.0" } = {}) {
    this.documentMetadata = documentMetadata; // Should be an instance of DocumentMetadata
    this.imageResources = imageResources; // Should be an array of ImageResource instances
    this.sections = sections; // Should be an array of Section instances
    this.version = version;
  }
}

module.exports = {
  DocumentMetadata,
  ImageResource,
  CanonicalBlock,
  Section,
  CanonicalDocument
};