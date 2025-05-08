// Transforms a CanonicalDocument into a pre-render format suitable for PPTX generation.

const transformBlockToPptxPreRender = (block, imageResources) => {
    switch (block.type) {
        case 'PARAGRAPH':
            return { type: 'PARAGRAPH', text: block.text };
        case 'HEADER':
            // Headers within content blocks become titles within a slide
            return { type: 'TITLE', text: block.text, level: block.level || 1 };
        case 'UL':
        case 'OL':
            return {
                type: 'LIST',
                listType: block.type === 'UL' ? 'unordered' : 'ordered',
                items: block.children ? block.children.map(child => transformListItemToPptx(child, imageResources)) : []
            };
        case 'IMAGE_REFERENCE':
            const imageResource = imageResources.find(img => img.id === block.resourceId);
            return {
                type: 'IMAGE',
                src: imageResource ? imageResource.resolvedUrl : (block.src || ''), // Fallback to block.src if not found, though ideally it's always resolved
                alt: block.altText || '',
                caption: block.caption || ''
            };
        case 'TABLE':
            return {
                type: 'TABLE',
                headers: block.headers || [],
                rows: block.rows || []
            };
        // LI is handled by transformListItemToPptx
        default:
            console.warn(`PPTX Pre-render: Unknown block type "${block.type}"`);
            return null;
    }
};

// Helper function to transform list items, which can be strings or nested lists
const transformListItemToPptx = (listItemBlock, imageResources) => {
    if (listItemBlock.type === 'LI') {
        if (!listItemBlock.children || listItemBlock.children.length === 0) {
            return ""; // Empty LI
        }

        let textContent = "";
        let nestedListObject = null;

        // Iterate over children to find text and potential nested lists
        for (const child of listItemBlock.children) {
            if (child.type === 'UL' || child.type === 'OL') {
                // Prioritize the first nested list found within the LI's children
                if (!nestedListObject) {
                    nestedListObject = transformBlockToPptxPreRender(child, imageResources);
                }
            } else if (child.type === 'TEXT_CONTENT' || child.type === 'PARAGRAPH') {
                textContent += (child.text || "") + " ";
            }
            // Other block types within an LI (e.g., IMAGE_REFERENCE) are not directly
            // converted into the string item or a standard nested list structure here.
            // The current PPTX pre-render format for list items expects strings or list objects.
        }

        textContent = textContent.trim();

        // If a nested list object was created, it takes precedence for this list item.
        // This aligns with tests where an LI containing a nested list resolves to the list object.
        if (nestedListObject) {
            // If there was introductory text before the nested list within the same LI,
            // the current simple structure (item is string OR list object) means that text is ignored.
            // e.g. <li>Intro text <ol>...</ol></li> results in just the <ol> part.
            return nestedListObject;
        }

        // If no nested list, return the concatenated text content.
        if (textContent !== "") {
            return textContent;
        }

        // Fallback for LIs that are not empty but didn't yield text or a nested list
        // (e.g., an LI containing only an IMAGE_REFERENCE).
        // The desired output for such cases isn't strictly defined by current tests for list items.
        // Returning a placeholder or a specific object type might be needed if such cases are common.
        // For now, a generic placeholder if it had children but nothing usable was extracted.
        if (listItemBlock.children.length > 0) {
            // Attempt to get a string representation for a non-standard child if necessary
            const firstChild = listItemBlock.children[0];
            if (firstChild.type === 'IMAGE_REFERENCE') {
                const imageAlt = firstChild.altText || (firstChild.resourceId ? `Image: ${firstChild.resourceId}` : 'Image');
                return `[${imageAlt}]`; // Placeholder for image in LI
            }
            return "[List item with complex or unhandled content]";
        }

        return ""; // Should be caught by the initial empty check, but as a final fallback.
    }
    // This function is intended for LI blocks. If called with something else, delegate.
    return transformBlockToPptxPreRender(listItemBlock, imageResources);
};


const transformToPptxPreRender = (canonicalDoc) => {
    if (!canonicalDoc) {
        return []; // No document, no slides
    }

    const slides = [];
    let currentSlide = null;

    // 1. Document Title Slide (if title exists)
    if (canonicalDoc.documentMetadata && canonicalDoc.documentMetadata.title) {
        currentSlide = {
            type: 'SLIDE',
            title: canonicalDoc.documentMetadata.title,
            elements: []
        };
        slides.push(currentSlide);
    }

    // 2. Process Sections
    if (canonicalDoc.sections && canonicalDoc.sections.length > 0) {
        canonicalDoc.sections.forEach(section => {
            // Start a new slide for each section
            // If there was no doc title, the first section starts the first slide.
            // If there was a doc title, and this section has a header, it also starts a new slide.
            // If there was a doc title, and this section has NO header, its content goes into the existing slide.
            if (section.header) {
                if (currentSlide && currentSlide.elements.length === 0 && !currentSlide.title) {
                    // If current slide is empty and has no title (e.g. from doc metadata), use this section's header
                    currentSlide.title = section.header;
                } else {
                     // Create a new slide for this section
                    currentSlide = {
                        type: 'SLIDE',
                        title: section.header,
                        elements: []
                    };
                    slides.push(currentSlide);
                }
            } else if (!currentSlide) {
                // No doc title, and first section has no header. Create a generic slide.
                 currentSlide = {
                    type: 'SLIDE',
                    title: '', // No title for this slide initially
                    elements: []
                };
                slides.push(currentSlide);
            }
            // If currentSlide is null here, it means no doc title and the first section also had no header.
            // We should have created a generic slide above.

            // Add content blocks to the current slide
            if (section.contentBlocks && section.contentBlocks.length > 0) {
                if (!currentSlide) { // Should not happen if logic above is correct
                    console.warn("PPTX Pre-render: Attempting to add blocks without a current slide.");
                    currentSlide = { type: 'SLIDE', title: 'Untitled Slide', elements: [] };
                    slides.push(currentSlide);
                }
                section.contentBlocks.forEach(block => {
                    const pptxElement = transformBlockToPptxPreRender(block, canonicalDoc.imageResources || []);
                    if (pptxElement) {
                        currentSlide.elements.push(pptxElement);
                    }
                });
            }
        });
    } else if (slides.length === 0) { // No sections and no doc title
        return []; // Return empty if there's truly nothing to render
    }


    // If only a document title was provided, and no sections/content,
    // the slides array will have one slide with a title and empty elements. This is fine.
    return slides;
};

module.exports = {
    transformToPptxPreRender,
    // transformBlockToPptxPreRender // Not typically exported directly unless for testing specific blocks
};
