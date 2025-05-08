// The actual function will be imported from:
const { transformToMarkdown } = require('../../transformation/markdown_transformer');

// For TDD, we define the tests first. The `transformToMarkdown` function
// will need to be implemented in `new_architecture/transformation/markdown_transformer.js`.

describe('MarkdownTransformer', () => {
    test('should transform a CanonicalDocument with one section header and one paragraph to Markdown', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Test Document' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Section One',
                    contentBlocks: [
                        {
                            blockId: 'b1',
                            type: 'PARAGRAPH',
                            text: 'This is a simple paragraph.',
                            children: []
                        }
                    ]
                }
            ]
        };

        const expectedMarkdown = "# Section One\n\nThis is a simple paragraph.";

        // When `transformToMarkdown` is implemented in the actual module:
        // 1. Uncomment the import at the top.
        // 2. Remove or comment out the local placeholder `transformToMarkdown` function.
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should return empty string for a CanonicalDocument with no sections', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Empty Document' },
            imageResources: [],
            sections: []
        };
        const expectedMarkdown = "";
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform a section with no header as just its content', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'No Header Section Doc' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    // No header property
                    contentBlocks: [
                        {
                            blockId: 'b1',
                            type: 'PARAGRAPH',
                            text: 'This is a paragraph in a section with no header.',
                            children: []
                        }
                    ]
                }
            ]
        };
        const expectedMarkdown = "This is a paragraph in a section with no header.";
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform a section with a header but no contentBlocks', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Header Only Section Doc' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Only Header Here',
                    contentBlocks: [] // No content blocks
                }
            ]
        };
        const expectedMarkdown = "# Only Header Here";
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform a section with multiple paragraphs', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Multi-paragraph Section Doc' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Section with Many Paragraphs',
                    contentBlocks: [
                        {
                            blockId: 'b1',
                            type: 'PARAGRAPH',
                            text: 'This is the first paragraph.',
                            children: []
                        },
                        {
                            blockId: 'b2',
                            type: 'PARAGRAPH',
                            text: 'This is the second paragraph.',
                            children: []
                        },
                        {
                            blockId: 'b3',
                            type: 'PARAGRAPH',
                            text: 'And this is a third one.',
                            children: []
                        }
                    ]
                }
            ]
        };
        const expectedMarkdown = `# Section with Many Paragraphs

This is the first paragraph.

This is the second paragraph.

And this is a third one.`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform a document with multiple sections', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Multi-Section Document' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'First Section Header',
                    contentBlocks: [
                        {
                            blockId: 'b1.1',
                            type: 'PARAGRAPH',
                            text: 'Paragraph in first section.',
                            children: []
                        }
                    ]
                },
                {
                    sectionId: 's2',
                    header: 'Second Section Header',
                    contentBlocks: [
                        {
                            blockId: 'b2.1',
                            type: 'PARAGRAPH',
                            text: 'Paragraph in second section.',
                            children: []
                        }
                    ]
                }
            ]
        };
        const expectedMarkdown = `# First Section Header

Paragraph in first section.

# Second Section Header

Paragraph in second section.`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should handle different header levels within content blocks', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Document with Subheaders' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Main Section Title', // This will be H1 by current convention
                    contentBlocks: [
                        {
                            blockId: 'b1',
                            type: 'HEADER',
                            text: 'Subheader Level 2',
                            level: 2, 
                            children: []
                        },
                        {
                            blockId: 'b2',
                            type: 'PARAGRAPH',
                            text: 'Paragraph after H2 subheader.',
                            children: []
                        },
                        {
                            blockId: 'b3',
                            type: 'HEADER',
                            text: 'Subheader Level 3',
                            level: 3,
                            children: []
                        },
                        {
                            blockId: 'b4',
                            type: 'PARAGRAPH',
                            text: 'Paragraph after H3 subheader.',
                            children: []
                        },
                        {
                            blockId: 'b5',
                            type: 'HEADER',
                            text: 'Subheader Level 1 (Explicit)',
                            level: 1,
                            children: []
                        },
                        {
                            blockId: 'b6',
                            type: 'PARAGRAPH',
                            text: 'Paragraph after explicit H1 subheader.',
                            children: []
                        }
                    ]
                }
            ]
        };
        const expectedMarkdown = `# Main Section Title

## Subheader Level 2

Paragraph after H2 subheader.

### Subheader Level 3

Paragraph after H3 subheader.

# Subheader Level 1 (Explicit)

Paragraph after explicit H1 subheader.`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform unordered lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Unordered List Doc' },
            imageResources: [],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'ul1', type: 'UL', children: [
                        { blockId: 'li1', type: 'LI', children: [{ blockId: 'p1', type: 'PARAGRAPH', text: 'Item 1', children: [] }] },
                        { blockId: 'li2', type: 'LI', children: [{ blockId: 'p2', type: 'PARAGRAPH', text: 'Item 2', children: [] }] }
                    ]
                }]
            }]
        };
        const expectedMarkdown = `- Item 1
- Item 2`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform ordered lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Ordered List Doc' },
            imageResources: [],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'ol1', type: 'OL', children: [
                        { blockId: 'li1', type: 'LI', children: [{ blockId: 'p1', type: 'PARAGRAPH', text: 'First item', children: [] }] },
                        { blockId: 'li2', type: 'LI', children: [{ blockId: 'p2', type: 'PARAGRAPH', text: 'Second item', children: [] }] }
                    ]
                }]
            }]
        };
        const expectedMarkdown = `1. First item
2. Second item`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform nested lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Nested List Doc' },
            imageResources: [],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'ul1', type: 'UL', children: [
                        { blockId: 'li1', type: 'LI', children: [
                            { blockId: 'p1', type: 'PARAGRAPH', text: 'Outer item 1', children: [] },
                            { blockId: 'ol1_nested', type: 'OL', children: [
                                { blockId: 'li1.1', type: 'LI', children: [{ blockId: 'p1.1', type: 'PARAGRAPH', text: 'Inner item A', children: [] }] },
                                { blockId: 'li1.2', type: 'LI', children: [{ blockId: 'p1.2', type: 'PARAGRAPH', text: 'Inner item B', children: [] }] }
                            ]}
                        ]},
                        { blockId: 'li2', type: 'LI', children: [{ blockId: 'p2', type: 'PARAGRAPH', text: 'Outer item 2', children: [] }] }
                    ]
                }]
            }]
        };
        const expectedMarkdown = `- Outer item 1
  1. Inner item A
  2. Inner item B
- Outer item 2`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform image references with caption', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Image with Caption Doc' },
            imageResources: [{ resourceId: 'img1', src: 'http://example.com/image.png', altText: 'An example image' }],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'imgRef1', type: 'IMAGE_REFERENCE', resourceId: 'img1', caption: 'This is a caption.'
                }]
            }]
        };
        const expectedMarkdown = `![An example image](http://example.com/image.png)
*This is a caption.*`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should transform image references without caption', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Image No Caption Doc' },
            imageResources: [{ resourceId: 'img1', src: 'http://example.com/image.png', altText: 'Alt text only' }],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'imgRef1', type: 'IMAGE_REFERENCE', resourceId: 'img1' // No caption
                }]
            }]
        };
        const expectedMarkdown = `![Alt text only](http://example.com/image.png)`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });
    
    test('should transform tables', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Table Doc' },
            imageResources: [],
            sections: [{
                sectionId: 's1',
                contentBlocks: [{
                    blockId: 'table1', type: 'TABLE', children: [
                        { blockId: 'thead1', type: 'THEAD', children: [
                            { blockId: 'tr_h', type: 'TR', children: [
                                { blockId: 'th1', type: 'TH', children: [{ blockId: 'p_h1', type: 'PARAGRAPH', text: 'Header 1', children: []}] },
                                { blockId: 'th2', type: 'TH', children: [{ blockId: 'p_h2', type: 'PARAGRAPH', text: 'Header 2', children: []}] }
                            ]}
                        ]},
                        { blockId: 'tbody1', type: 'TBODY', children: [
                            { blockId: 'tr_r1', type: 'TR', children: [
                                { blockId: 'td_r1c1', type: 'TD', children: [{ blockId: 'p_r1c1', type: 'PARAGRAPH', text: 'Row 1, Col 1', children: []}] },
                                { blockId: 'td_r1c2', type: 'TD', children: [{ blockId: 'p_r1c2', type: 'PARAGRAPH', text: 'Row 1, Col 2', children: []}] }
                            ]},
                            { blockId: 'tr_r2', type: 'TR', children: [
                                { blockId: 'td_r2c1', type: 'TD', children: [{ blockId: 'p_r2c1', type: 'PARAGRAPH', text: 'Row 2, Col 1', children: []}] },
                                { blockId: 'td_r2c2', type: 'TD', children: [{ blockId: 'p_r2c2', type: 'PARAGRAPH', text: 'Row 2, Col 2', children: []}] }
                            ]}
                        ]}
                    ]
                }]
            }]
        };
        const expectedMarkdown = `| Header 1 | Header 2 |
|--------------|--------------|
| Row 1, Col 1 | Row 1, Col 2 |
| Row 2, Col 1 | Row 2, Col 2 |`; // Removed extra spaces from header cells
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should handle special Markdown characters in text (no escaping by default)', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Special Chars Doc' },
            imageResources: [],
            sections: [{
                sectionId: 's1',
                header: 'Section with *Special* Chars',
                contentBlocks: [
                    { blockId: 'p1', type: 'PARAGRAPH', text: 'This has _italic_ and **bold** and a [link](http://example.com).', children: [] },
                    { blockId: 'p2', type: 'PARAGRAPH', text: 'Some \\\`code\\\` and \\\\ and an asterisk * should appear as typed.', children: [] }
                ]
            }]
        };
        const expectedMarkdown = `# Section with *Special* Chars

This has _italic_ and **bold** and a [link](http://example.com).

Some \\\`code\\\` and \\\\ and an asterisk * should appear as typed.`;
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    test('should return empty string for a document with only metadata and no sections/imageResources', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Metadata Only Doc' }
            // No imageResources, no sections
        };
        const expectedMarkdown = "";
        expect(transformToMarkdown(canonicalDoc)).toBe(expectedMarkdown);
    });

    // TODO: Add more test cases:
    // - Section with no header (Done)
    // - Section with no contentBlocks (Done)
    // - Multiple paragraphs in one section (Done)
    // - Multiple sections (Done)
    // - Different header levels (e.g., H1, H2 based on a 'level' property in HEADER blocks) (Done)
    // - Unordered lists (UL > LI > PARAGRAPH) (Done)
    // - Ordered lists (OL > LI > PARAGRAPH) (Done)
    // - Nested lists (Done)
    // - Image references (IMAGE_REFERENCE block type) (Done)
    // - Tables (TABLE > THEAD > TBODY > TR > TH/TD > PARAGRAPH) (Done)
    // - Figures with captions (FIGURE > IMAGE_REFERENCE + CAPTION > PARAGRAPH) (Covered by Image with caption)
    // - Handling of special Markdown characters in text content (Done - basic case)
    // - CanonicalDocument with only documentMetadata and no sections/imageResources (Done)
});
