const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs'); // Keep for now, might be removed if CLI is fully deprecated
const path = require('path'); // Keep for now
const express = require('express'); // Added express

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

    let mainContent = $('#page'); // Common on Squarespace
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
        throw new Error("Could not find a valid main content element. Cannot proceed with scraping specific sections.");
    }

    console.log(`Using main content for scraping.`);

    const markdownPromises = [];
    let imageCounter = 0;

    mainContent.find('*').each((i, element) => {
        const $el = $(element);
        const tag = $el.prop('tagName');

        if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
            const headerText = $el.text().trim();
            if (headerText) {
                markdownPromises.push(Promise.resolve(`# ${headerText}`));
            }
        } else if (tag === 'P') {
            const pText = $el.text().trim();
            if (pText) {
                markdownPromises.push(Promise.resolve(pText));
            }
        } else if (tag === 'IMG') {
            const src = $el.attr('src');
            if (src) {
                const altText = $el.attr('alt') || `Image ${++imageCounter}`;
                if (src.startsWith('data:image')) {
                    markdownPromises.push(Promise.resolve(`![${altText}](${src})`));
                } else {
                    const absoluteUrl = new URL(src, url).href;
                    markdownPromises.push(
                        fetchImageAsBase64(absoluteUrl).then(base64Data => {
                            if (base64Data) {
                                return `![${altText}](${base64Data})`;
                            }
                            return null;
                        })
                    );
                }
            }
        }
    });

    const resolvedMarkdownElements = await Promise.all(markdownPromises);
    const markdownLines = resolvedMarkdownElements.filter(line => line !== null);

    return markdownLines.join('\\n\\n');
}

// Determine mode of operation based on CLI arguments
if (process.argv[2]) {
    // CLI Mode
    const cliUrl = process.argv[2];
    const cliOutputFilePath = process.argv[3]; // Optional output file path argument

    console.log(`CLI mode: Scraping ${cliUrl}`);
    if (!cliUrl) { // Should not happen if process.argv[2] is true, but good for robustness
        console.error('CLI Usage: node edtomorrow_scrape_md.js <URL> [OutputFilePath]');
        process.exit(1);
    }

    scrapeToMarkdown(cliUrl)
        .then(markdown => {
            const finalOutputFilePath = cliOutputFilePath || `scraped_markdown_${new URL(cliUrl).hostname.replace(/\\./g, '_')}.md`;
            fs.writeFileSync(finalOutputFilePath, markdown, 'utf8');
            console.log(`CLI: Markdown with embedded images saved to: ${finalOutputFilePath}`);
        })
        .catch(error => {
            console.error('CLI Error:', error.message);
            process.exit(1); // Exit with error code for CLI failures
        });

} else {
    // Server Mode
    console.log("No CLI URL provided. Starting in server mode...");
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get('/markdown', async (req, res) => {
        const targetUrl = req.query.url;
        if (!targetUrl) {
            return res.status(400).send('Missing URL parameter. Usage: /markdown?url=<target_url>');
        }

        console.log(`Received request to scrape: ${targetUrl}`);
        try {
            const markdownContent = await scrapeToMarkdown(targetUrl);
            res.type('text/markdown; charset=utf-8').send(markdownContent);
        } catch (error) {
            console.error(`Error scraping ${targetUrl}:`, error.message);
            res.status(500).send(`Error scraping URL: ${error.message}`);
        }
    });

    app.listen(PORT, () => {
        console.log(`Scraping service running on http://localhost:${PORT}`);
    });
}

// The script will now either run the CLI part or start the server.
// The previous trailing comments about CLI logic can be considered addressed by this structure.
