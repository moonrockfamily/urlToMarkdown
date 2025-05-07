const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHtml(url) {
    try {
        console.log(`Fetching HTML from ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch page content from ${url}:`, error.message);
        throw new Error(`Failed to fetch page content from ${url}: ${error.message}`);
    }
}

async function fetchImageAsBase64(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const imageType = response.headers['content-type'] || 'image/jpeg'; // Default to jpeg if type not found
        return `data:${imageType};base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error(`Failed to fetch or convert image ${imageUrl}:`, error.message);
        return null; // Return null if fetching or conversion fails
    }
}

async function scrapeToMarkdown(url) {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    let mainContent = $('#page');
    if (!mainContent.length) {
        console.warn("Could not find element with ID 'page'. Trying common class names...");
        const possibleSelectors = ['.sqs-layout', '.main-content', '.content-wrapper', '[role="main"]'];
        for (const selector of possibleSelectors) {
            mainContent = $(selector);
            if (mainContent.length) {
                console.log(`Found main content using selector: ${selector}`);
                break;
            }
        }
    }
    if (!mainContent.length) {
        console.warn("Could not find a specific main content element. Falling back to 'body'.");
        mainContent = $('body');
    }
    if (!mainContent.length) {
        throw new Error("Could not find a valid main content element.");
    }
    console.log(`Using main content for scraping.`);

    const elements = [];
    mainContent.find('h1, h2, h3, p, img').each((i, el) => {
        const $el = $(el);
        const tagName = $el.prop('tagName').toUpperCase();
        if (tagName === 'H1' || tagName === 'H2' || tagName === 'H3') {
            const text = $el.text().trim();
            if (text) {
                elements.push({ type: 'HEADER', text: text, level: parseInt(tagName.substring(1)) });
            }
        } else if (tagName === 'P') {
            const text = $el.text().trim();
            if (text) {
                elements.push({ type: 'PARAGRAPH', text: text });
            }
        } else if (tagName === 'IMG') {
            const src = $el.attr('src');
            if (src) {
                elements.push({ type: 'IMAGE', src: src, alt: $el.attr('alt') || '' });
            }
        }
    });

    const imageUrlsToFetch = new Set();
    elements.forEach(el => {
        if (el.type === 'IMAGE' && el.src && !el.src.startsWith('data:image')) {
            try {
                const absoluteUrl = new URL(el.src, url).href;
                imageUrlsToFetch.add(absoluteUrl);
            } catch (e) {
                console.warn(`Invalid image URL encountered and skipped: ${el.src}. Error: ${e.message}`);
            }
        }
    });

    const imageBase64Map = new Map();
    const fetchPromises = Array.from(imageUrlsToFetch).map(imgUrl =>
        fetchImageAsBase64(imgUrl).then(base64Data => {
            if (base64Data) {
                imageBase64Map.set(imgUrl, base64Data);
            }
        })
    );
    await Promise.all(fetchPromises);

    const sections = [];
    let currentSection = {
        id: 'section-0',
        header: 'Introduction', // Default for content before the first header
        level: 0,
        contentMarkdown: [],
        imagesUsedRefs: [] // Store image reference IDs used in this section
    };
    let sectionIdCounter = 0;
    let imageRefCounter = 0;
    const allImageDefinitions = []; // To store [ref]: data strings

    elements.forEach((el, index) => {
        if (el.type === 'HEADER') {
            // If currentSection has content or is a named section (not the initial empty intro),
            // or if it's the very first section being processed (even if intro and empty, to be replaced)
            if (currentSection.contentMarkdown.length > 0 || currentSection.imagesUsedRefs.length > 0 || currentSection.id !== 'section-0') {
                sections.push(currentSection);
            }
            sectionIdCounter++;
            currentSection = {
                id: `section-${sectionIdCounter}`,
                header: el.text,
                level: el.level,
                contentMarkdown: [],
                imagesUsedRefs: []
            };
        } else if (el.type === 'PARAGRAPH') {
            if (el.text) currentSection.contentMarkdown.push(el.text);
        } else if (el.type === 'IMAGE') {
            imageRefCounter++;
            const imageRefId = `image-${imageRefCounter}`;
            const altText = el.alt || `Image ${imageRefId}`;
            
            currentSection.contentMarkdown.push(`![${altText}][${imageRefId}]`);
            currentSection.imagesUsedRefs.push(imageRefId);

            let base64Data;
            let originalSrcForDefinition = el.src;
            try {
                if (el.src.startsWith('data:image')) {
                    base64Data = el.src;
                } else {
                    originalSrcForDefinition = new URL(el.src, url).href;
                    base64Data = imageBase64Map.get(originalSrcForDefinition);
                }
            } catch (e) {
                 console.warn(`Error processing image src for ref ${imageRefId}: ${el.src}. Using src as is. Error: ${e.message}`);
                 base64Data = null; 
            }

            if (base64Data) {
                allImageDefinitions.push(`[${imageRefId}]: ${base64Data}`);
            } else {
                allImageDefinitions.push(`[${imageRefId}]: ${originalSrcForDefinition} <!-- Image data unavailable -->`);
                console.warn(`Image data for ${originalSrcForDefinition} (ref ${imageRefId}) not found or processing failed, using original URL as fallback.`);
            }
        }
    });

    // Add the last processed section
    if (currentSection.contentMarkdown.length > 0 || currentSection.imagesUsedRefs.length > 0 || sections.length === 0 || currentSection.id !== 'section-0') {
         // Add if it has content, or it's the only section (even an empty intro), or it's a named section
        sections.push(currentSection);
    }
    
    // Cleanup: if the only section is an empty "Introduction", remove it.
    if (sections.length === 1 && sections[0].id === 'section-0' && sections[0].header === 'Introduction' && sections[0].contentMarkdown.length === 0 && sections[0].imagesUsedRefs.length === 0) {
        sections.pop();
    }
    // Ensure no duplicate image definitions (though imageRefCounter should prevent this for refs)
    const uniqueImageDefinitions = [...new Set(allImageDefinitions)];

    return {
        sections: sections,
        imageDefinitions: uniqueImageDefinitions
    };
}

module.exports = { scrapeToMarkdown, fetchHtml, fetchImageAsBase64 };
