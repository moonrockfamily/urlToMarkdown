// Defines RawExtractedItem
// ... (existing JSDoc comments for RawExtractedItem should be here) ...

class RawExtractedItem {
  /**
   * @param {object} params
   * @param {string} params.type - The type of content extracted (e.g., 'text', 'image', 'table', 'list_item', 'heading', 'video', 'audio', 'code_block', 'blockquote', 'horizontal_rule', 'metadata').
   * @param {object} [params.data] - The actual extracted data. The structure of this object will vary based on the 'type'.
   * @param {string} [params.data.text] - Text content.
   * @param {string} [params.data.url] - URL for 'image', 'video', 'audio'.
   * @param {string} [params.data.altText] - Alternative text for an image.
   * @param {string} [params.data.caption] - Caption for an image, video, or table.
   * @param {Array<Array<string>>} [params.data.rows] - For 'table' type.
   * @param {boolean} [params.data.isHeader] - For 'table' type.
   * @param {number} [params.data.level] - For 'heading' or 'list_item' (indentation).
   * @param {string} [params.data.language] - For 'code_block'.
   * @param {string} [params.data.code] - For 'code_block'.
   * @param {string} [params.data.ordered] - For 'list_item' (e.g., '1.', 'a.').
   * @param {string} [params.data.metaName] - For 'metadata'.
   * @param {string} [params.data.metaValue] - For 'metadata'.
   * @param {string} [params.sourceUrl] - The URL from which this item was extracted.
   * @param {string} [params.selector] - The CSS selector or XPath used to extract this item, if applicable.
   * @param {number} [params.order] - The original order of this item as it appeared on the source page/document.
   * @param {object} [params.attributes] - Any other relevant HTML attributes or source-specific properties.
   * @param {Array<RawExtractedItem>} [params.children] - For nested structures like nested lists.
   */
  constructor({
    type,
    data = {},
    sourceUrl,
    selector,
    order,
    attributes = {},
    children = []
  } = {}) {
    if (!type) {
      throw new Error("RawExtractedItem requires a 'type'.");
    }
    this.type = type;
    this.data = data;
    this.sourceUrl = sourceUrl;
    this.selector = selector;
    this.order = order;
    this.attributes = attributes;
    this.children = children.map(childData => childData instanceof RawExtractedItem ? childData : new RawExtractedItem(childData));
  }
}

module.exports = { RawExtractedItem };