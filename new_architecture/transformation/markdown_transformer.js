// Converts CanonicalDocument to Markdown

const transformBlockToMarkdown = (block, imageResources, listLevel = 0) => {
    const indent = '  '.repeat(listLevel);

    switch (block.type) {
        case 'PARAGRAPH':
            return block.text;
        case 'HEADER':
            return `${'#'.repeat(block.level || 1)} ${block.text}`;
        case 'UL':
        case 'OL':
            const listItems = [];
            if (block.children && block.children.length > 0) {
                block.children.forEach((li, index) => { // li is an LI block
                    if (li.type === 'LI' && li.children && li.children.length > 0) {
                        const marker = block.type === 'UL' ? '-' : `${index + 1}.`;
                        
                        let liContentPieces = []; // Pieces of content for *this* list item
                        li.children.forEach((liChild) => {
                            if (liChild.type === 'UL' || liChild.type === 'OL') {
                                // Nested list: get its full string, correctly indented for the next level
                                liContentPieces.push(transformBlockToMarkdown(liChild, imageResources, listLevel + 1));
                            } else if (liChild.type === 'PARAGRAPH') {
                                // Paragraph content for the list item
                                liContentPieces.push(liChild.text ? liChild.text.trim() : '');
                            } else {
                                // Other block types directly under LI (if any)
                                // Transform them normally, but ensure no undue list-level indent from this call
                                const transformedChild = transformBlockToMarkdown(liChild, imageResources, 0);
                                if (transformedChild && transformedChild.length > 0) {
                                    liContentPieces.push(transformedChild.trim());
                                }
                            }
                        });
                        
                        // Join the pieces of the LI. E.g., "Paragraph text" + "\n" + "  - Nested item"
                        const liContent = liContentPieces.join('\n');
                        listItems.push(`${indent}${marker} ${liContent}`);
                    }
                });
            }
            return listItems.join('\n'); // All items of THIS list joined by \n

        case 'IMAGE_REFERENCE':
            const imageResource = imageResources.find(img => img.resourceId === block.resourceId);
            if (imageResource) {
                let imgMarkdown = `![${imageResource.altText || ''}](${imageResource.src || ''})`;
                if (block.caption) {
                    imgMarkdown += `\n*${block.caption}*`;
                }
                return imgMarkdown;
            }
            return ''; // Or handle missing resource

        case 'TABLE':
            const tableRows = [];
            if (block.children) { // Children are THEAD, TBODY
                block.children.forEach(tableSection => {
                    if (tableSection.children) { // Children are TR
                        tableSection.children.forEach((tr, rowIndex) => {
                            const rowCells = [];
                            if (tr.children) { // Children are TH, TD
                                tr.children.forEach(cell => {
                                    if (cell.children && cell.children.length > 0 && cell.children[0].text) {
                                        rowCells.push(cell.children[0].text);
                                    } else {
                                        rowCells.push('');
                                    }
                                });
                            }
                            tableRows.push(`| ${rowCells.join(' | ')} |`);
                            if (tableSection.type === 'THEAD' && tableSection.children.indexOf(tr) === 0) { // First TR in THEAD
                                tableRows.push(`|${rowCells.map(() => '--------------').join('|')}|`);
                            }
                        });
                    }
                });
            }
            return tableRows.join('\n');
        default:
            // console.warn(`Unsupported block type: ${block.type}`);
            return '';
    }
};

const transformToMarkdown = (canonicalDoc) => {
    if (!canonicalDoc || (!canonicalDoc.sections && !canonicalDoc.imageResources)) {
        return "";
    }
    if (!canonicalDoc.sections || canonicalDoc.sections.length === 0) {
        // If there are imageResources but no sections, decide if they should be rendered.
        // For now, sticking to sections as the primary content containers.
        return "";
    }

    const sectionStrings = [];
    const imageResources = canonicalDoc.imageResources || [];

    canonicalDoc.sections.forEach(section => {
        let sectionHeaderMD = "";
        if (section.header) {
            sectionHeaderMD = `# ${section.header}`;
        }

        let sectionBlocksMD = "";
        if (section.contentBlocks && section.contentBlocks.length > 0) {
            const blockMarkdownStrings = section.contentBlocks.map(block => {
                // For top-level blocks in a section, listLevel is 0
                return transformBlockToMarkdown(block, imageResources, 0);
            }).filter(md => md && md.length > 0); // Filter out empty strings from unsupported types or empty blocks

            if (blockMarkdownStrings.length > 0) {
                sectionBlocksMD = blockMarkdownStrings.join('\n\n'); // Join distinct blocks with double newlines
            }
        }
        
        let fullSectionMD = "";
        if (sectionHeaderMD && sectionBlocksMD) {
            fullSectionMD = `${sectionHeaderMD}\n\n${sectionBlocksMD}`;
        } else if (sectionHeaderMD) {
            fullSectionMD = sectionHeaderMD;
        } else if (sectionBlocksMD) {
            fullSectionMD = sectionBlocksMD;
        }

        if (fullSectionMD) {
            sectionStrings.push(fullSectionMD);
        }
    });
    return sectionStrings.join('\n\n').trim(); // Join sections with double newlines
};

module.exports = {
    transformToMarkdown
};
