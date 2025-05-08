// Converts CanonicalDocument to HTML

const transformBlockToHtml = (block, imageResources) => {
    switch (block.type) {
        case 'PARAGRAPH':
            return `<p>${block.text}</p>`;
        case 'HEADER':
            const level = block.level || 1;
            return `<h${level}>${block.text}</h${level}>`;
        case 'UL':
        case 'OL': {
            const tag = block.type === 'UL' ? 'ul' : 'ol';
            if (!block.children || block.children.length === 0) {
                return `<${tag}></${tag}>`;
            }

            const liStringsArray = block.children.map(liBlock => {
                let mainContent = '';
                let nestedListString = '';
                let nonListContentCount = 0;

                if (liBlock.children && liBlock.children.length > 0) {
                    const contentParts = [];
                    liBlock.children.forEach(childOfLi => {
                        if (childOfLi.type === 'UL' || childOfLi.type === 'OL') {
                            const rawNestedListHtml = transformBlockToHtml(childOfLi, imageResources);
                            // Indent the nested list relative to the LI's content area
                            nestedListString = rawNestedListHtml.split('\n').map(line => `  ${line}`).join('\n');
                        } else {
                            nonListContentCount++;
                            contentParts.push(transformBlockToHtml(childOfLi, imageResources));
                        }
                    });
                    mainContent = contentParts.join(''); // Should be like <p>text</p>
                }

                let liHtml;
                // A LI is complex if it has a nested list or more than one non-list content block.
                const isComplexLi = nestedListString || (nonListContentCount > 1);

                if (isComplexLi) { 
                    liHtml = '<li>'; // Starts unindented relative to its content
                    if (mainContent) {
                        // Indent main content by 2 spaces and place on a new line
                        const indentedMainContent = mainContent.split('\n').map(line => `  ${line}`).join('\n');
                        liHtml += `\n${indentedMainContent}`;
                    }
                    if (nestedListString) { // nestedListString is already formatted with its own 2-space indent for its content
                        liHtml += `\n${nestedListString}`; 
                    }
                    liHtml += '\n</li>'; // Close LI on a new line
                } else { // Simple LI (at most one non-list content block, no nested list)
                    liHtml = `<li>${mainContent}</li>`; // e.g. <li><p>text</p></li>
                }
                return liHtml;
            });

            // Indent each complete <li>...</li> block string by 2 spaces before joining them
            const indentedLiHtmlStrings = liStringsArray.map(singleLiHtml => {
                return singleLiHtml.split('\n').map(line => `  ${line}`).join('\n');
            });
            const allIndentedLiHtml = indentedLiHtmlStrings.join('\n');
            
            return `<${tag}>\n${allIndentedLiHtml}\n</${tag}>`;
        }
        default:
            return '';
    }
};

const transformToHtml = (canonicalDoc) => {
    if (!canonicalDoc || !canonicalDoc.sections || canonicalDoc.sections.length === 0) {
        return "";
    }

    const sectionHtmlParts = canonicalDoc.sections.map(section => {
        const sectionIdAttr = section.sectionId ? ` id="${section.sectionId}"` : '';
        let sectionContentParts = [];

        if (section.header) {
            sectionContentParts.push(`  <h1>${section.header}</h1>`);
        }

        if (section.contentBlocks && section.contentBlocks.length > 0) {
            section.contentBlocks.forEach(block => {
                const blockHtml = transformBlockToHtml(block, canonicalDoc.imageResources || []);
                if (blockHtml) {
                    const indentedBlockHtml = blockHtml.split('\n').map(line => `  ${line}`).join('\n');
                    sectionContentParts.push(indentedBlockHtml);
                }
            });
        }
        
        if (sectionContentParts.length === 0) {
            // Handle sections that might be empty or only have an ID defined
            // but no actual header or content blocks that render to HTML.
            // For now, if it has an ID, render the section tag, otherwise it might be skipped if empty.
            if (section.sectionId) return `<section${sectionIdAttr}>\n</section>`;
            return ''; // Or decide to render <section></section> even if empty and no ID
        }

        return `<section${sectionIdAttr}>\n${sectionContentParts.join('\n')}\n</section>`;
    });

    return sectionHtmlParts.filter(part => part !== '').join('\n').trim();
};

module.exports = {
    transformToHtml
};
