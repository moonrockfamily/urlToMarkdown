// filepath: c:\\Users\\thiles\\gitrepo\\urlToMarkdown\\new_architecture\\tests\\transformation\\html_transformer.test.js
const { transformToHtml } = require('../../transformation/html_transformer');

describe('HtmlTransformer', () => {
    test('should transform a CanonicalDocument with one section header and one paragraph to HTML', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Test Document HTML' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Section One HTML',
                    contentBlocks: [
                        {
                            blockId: 'b1',
                            type: 'PARAGRAPH',
                            text: 'This is a simple HTML paragraph.',
                            children: []
                        }
                    ]
                }
            ]
        };

        // Basic expected HTML structure. Might need refinement for exact spacing/newlines.
        const expectedHtml = `
<section id="s1">
  <h1>Section One HTML</h1>
  <p>This is a simple HTML paragraph.</p>
</section>`.trim();

        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should return empty string for a CanonicalDocument with no sections', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Empty HTML Document' },
            imageResources: [],
            sections: []
        };
        const expectedHtml = "";
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform a section with no header as just its content within a section tag', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'No Header Section HTML Doc' },
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
        const expectedHtml = `
<section id="s1">
  <p>This is a paragraph in a section with no header.</p>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform a section with a header but no contentBlocks', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Header Only Section HTML Doc' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Only Header Here HTML',
                    contentBlocks: [] // No content blocks
                }
            ]
        };
        const expectedHtml = `
<section id="s1">
  <h1>Only Header Here HTML</h1>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform a section with multiple paragraphs', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Multi-paragraph Section HTML Doc' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Section with Many HTML Paragraphs',
                    contentBlocks: [
                        { blockId: 'b1', type: 'PARAGRAPH', text: 'First HTML paragraph.', children: [] },
                        { blockId: 'b2', type: 'PARAGRAPH', text: 'Second HTML paragraph.', children: [] }
                    ]
                }
            ]
        };
        const expectedHtml = `
<section id="s1">
  <h1>Section with Many HTML Paragraphs</h1>
  <p>First HTML paragraph.</p>
  <p>Second HTML paragraph.</p>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform a document with multiple sections', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Multi-Section HTML Document' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'First HTML Section',
                    contentBlocks: [{ blockId: 'b1.1', type: 'PARAGRAPH', text: 'Content of first section.', children: [] }]
                },
                {
                    sectionId: 's2',
                    header: 'Second HTML Section',
                    contentBlocks: [{ blockId: 'b2.1', type: 'PARAGRAPH', text: 'Content of second section.', children: [] }]
                }
            ]
        };
        const expectedHtml = `
<section id="s1">
  <h1>First HTML Section</h1>
  <p>Content of first section.</p>
</section>
<section id="s2">
  <h1>Second HTML Section</h1>
  <p>Content of second section.</p>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should handle different header levels within content blocks', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'HTML Document with Subheaders' },
            imageResources: [],
            sections: [
                {
                    sectionId: 's1',
                    header: 'Main Section Title (H1)', // Section header defaults to H1
                    contentBlocks: [
                        { blockId: 'b1', type: 'HEADER', text: 'Subheader Level 2', level: 2, children: [] },
                        { blockId: 'b2', type: 'PARAGRAPH', text: 'Paragraph after H2.', children: [] },
                        { blockId: 'b3', type: 'HEADER', text: 'Subheader Level 3', level: 3, children: [] },
                        { blockId: 'b4', type: 'PARAGRAPH', text: 'Paragraph after H3.', children: [] },
                        { blockId: 'b5', type: 'HEADER', text: 'Subheader Level 1 (Explicit H1)', level: 1, children: [] }
                    ]
                }
            ]
        };
        const expectedHtml = `
<section id="s1">
  <h1>Main Section Title (H1)</h1>
  <h2>Subheader Level 2</h2>
  <p>Paragraph after H2.</p>
  <h3>Subheader Level 3</h3>
  <p>Paragraph after H3.</p>
  <h1>Subheader Level 1 (Explicit H1)</h1>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform unordered lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Unordered List HTML Doc' },
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
        const expectedHtml = `
<section id="s1">
  <ul>
    <li><p>Item 1</p></li>
    <li><p>Item 2</p></li>
  </ul>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform ordered lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Ordered List HTML Doc' },
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
        const expectedHtml = `
<section id="s1">
  <ol>
    <li><p>First item</p></li>
    <li><p>Second item</p></li>
  </ol>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });

    test('should transform nested lists', () => {
        const canonicalDoc = {
            documentMetadata: { title: 'Nested List HTML Doc' },
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
        // Note: HTML structure for nested lists typically has the nested list *inside* the <li> of its parent.
        const expectedHtml = `
<section id="s1">
  <ul>
    <li>
      <p>Outer item 1</p>
      <ol>
        <li><p>Inner item A</p></li>
        <li><p>Inner item B</p></li>
      </ol>
    </li>
    <li><p>Outer item 2</p></li>
  </ul>
</section>`.trim();
        expect(transformToHtml(canonicalDoc)).toBe(expectedHtml);
    });
});
