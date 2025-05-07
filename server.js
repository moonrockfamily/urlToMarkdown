console.log("Attempting to start server.js...");
const express = require('express');
const path = require('path');
const { scrapeToMarkdown } = require('./scraper_core.js');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`Preparing to listen on port ${PORT}...`);
app.listen(PORT, () => {
    console.log(`Scraping service running on http://localhost:${PORT}`);
    console.log(`Usage: http://localhost:${PORT}/markdown?url=<target_url>`);
});

// Utility function to escape HTML attributes
const escapeHtmlAttr = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/&/g, '&amp;');
};

// Route to serve the external client-side script
app.get('/client_script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'client_script.js')); // MODIFIED to use path.join
});

app.get('/markdown', async (req, res) => {
    try {
        const targetUrl = req.query.url;
        let scrapedData;
        let initialError = null;
        let pageTitle = "Markdown Scraper";
        // Default message, will be updated based on scraping outcome
        let sectionsHeaderMsg = 'Sections will appear here after scraping'; 

        if (targetUrl) {
            console.log(`Received request to scrape: ${targetUrl}`);
            pageTitle += `: ${escapeHtmlAttr(targetUrl)}`;
            try {
                scrapedData = await scrapeToMarkdown(targetUrl); // Use original targetUrl for scraping
                if (scrapedData && scrapedData.sections && scrapedData.sections.length > 0) {
                    sectionsHeaderMsg = 'Scraped Sections:';
                } else if (scrapedData) { // Scraped successfully but no sections
                    sectionsHeaderMsg = 'No sections found for this URL.';
                } else { // Should not happen if scrapeToMarkdown always returns object or throws
                     sectionsHeaderMsg = 'Scraping completed, but no data was returned.';
                }
            } catch (error) {
                const cleanErrorMessage = String(error.message || 'Unknown error').replace(/`/g, "'");
                const displayUrl = escapeHtmlAttr(targetUrl); // Escaped URL for display in error
                console.error(`Error scraping ${targetUrl}:`, error.message, error.stack);
                initialError = `Failed to scrape ${displayUrl}: ${cleanErrorMessage}`;
                scrapedData = { sections: [], imageDefinitions: [] }; // Ensure client script gets expected structure
                sectionsHeaderMsg = 'Sections (load failed)';
            }
        } else {
            console.log("No target URL provided, serving page with input.");
            scrapedData = { sections: [], imageDefinitions: [] }; // Default empty structure
            // sectionsHeaderMsg remains 'Sections will appear here after scraping'
        }

        // Sanitize JSON string for embedding in a <script type="application/json"> tag
        const jsonForDataScript = JSON.stringify(scrapedData)
            .replace(/<\/script>/gi, '<\\/script>'); // Corrected escaping for </script>

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${pageTitle}</title>
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
                <style>
                    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; line-height: 1.6; padding: 20px; margin: 0 auto; display: flex; gap: 20px; max-width: 1400px; background-color: #f0f2f5; }
                    #controls { width: 35%; background-color: #fff; border-right: 1px solid #d1d5db; padding: 20px; height: calc(100vh - 40px); overflow-y: auto; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; }
                    #content-display { width: 65%; background-color: #fff; padding: 20px; height: calc(100vh - 40px); display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; }
                    .url-input-container { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
                    .url-input-container label { display: block; margin-bottom: 8px; font-weight: 600; color: #374151; }
                    .url-input-container input[type="text"] { width: calc(100% - 24px); padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 12px; font-size: 0.95em; }
                    .url-input-container button { width: 100%; padding: 10px 15px; background-color: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; font-weight: 500; }
                    .url-input-container button:hover { background-color: #1d4ed8; }
                    #sections-container-wrapper { flex-grow: 1; overflow-y: auto; margin-top: 15px; }
                    #sectionsHeader { color: #1f2937; font-size: 1.1em; margin-bottom: 10px;}
                    .section-item { margin-bottom: 10px; display: flex; align-items: center; background-color: #f9fafb; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e7eb;}
                    .section-item input[type="checkbox"] { margin-right: 10px; width: 16px; height: 16px; }
                    .section-item label { font-size: 0.9em; color: #4b5563; flex-grow: 1; }
                    .section-item .level-1 { font-weight: 600; } /* This might be less relevant if header is an input */
                    .section-item .level-2 { padding-left: 20px; } /* This might be less relevant */
                    .section-item .level-3 { padding-left: 40px; } /* This might be less relevant */

                    /* Styles for editable fields */
                    .section-item-header-controls {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        margin-bottom: 8px; /* Space between header and content textarea */
                    }
                    .editable-header-text {
                        border: 1px solid #d1d5db;
                        padding: 6px 10px;
                        font-size: 0.95em;
                        border-radius: 4px;
                        margin-right: 5px;
                        flex-grow: 1;
                        line-height: 1.4;
                    }
                    .section-label-wrapper { /* The <label> wrapping the input and suffix */
                        display: flex;
                        align-items: center;
                        flex-grow: 1;
                        margin-left: 10px; /* Space after checkbox */
                        cursor: default; 
                    }
                    .section-header-suffix {
                        font-size: 0.85em;
                        color: #6b7280;
                        margin-left: 6px;
                        white-space: nowrap;
                    }
                    .editable-content-area {
                        width: calc(100% - 20px); /* Adjust based on padding of .section-item */
                        min-height: 100px;
                        border: 1px solid #d1d5db;
                        padding: 10px;
                        margin-top: 5px; /* Space from header controls */
                        border-radius: 4px;
                        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
                        font-size: 0.9em;
                        line-height: 1.6;
                        box-sizing: border-box;
                        margin-left: 26px; /* Align with header text, assuming checkbox width + margin */
                    }
                    /* Adjust section-item for new layout */
                    .section-item {
                        margin-bottom: 15px; /* Increased margin */
                        display: flex;
                        flex-direction: column; /* Stack header controls and textarea */
                        align-items: flex-start;
                        background-color: #f9fafb;
                        padding: 12px;
                        border-radius: 6px; /* Slightly more rounded */
                        border: 1px solid #e5e7eb;
                    }

                    /* Styles for drag and drop */
                    .section-item.dragging {
                        opacity: 0.6;
                        background: #e0e7ff; /* Lighter blue when dragging */
                    }
                    .section-item.drag-over-top {
                        border-top: 3px solid #3b82f6; /* Prominent blue line on top */
                        background-color: #eff6ff; /* Slight background for the item below */
                    }
                    .section-item.drag-over-bottom {
                        border-bottom: 3px solid #3b82f6; /* Prominent blue line on bottom */
                        background-color: #eff6ff; /* Slight background for the item above */
                    }
                    #sections-container.drag-over-empty {
                        border: 2px dashed #9ca3af; 
                        background-color: #f9fafb;
                        min-height: 50px; 
                    }

                    #output-tabs { display: flex; border-bottom: 1px solid #d1d5db; margin-bottom: 15px; }
                    .tab-button { padding: 12px 18px; cursor: pointer; border: none; background: none; border-bottom: 3px solid transparent; font-size: 0.95em; color: #4b5563; }
                    .tab-button.active { border-bottom-color: #2563eb; font-weight: 600; color: #1f2937;}
                    .tab-content { display: none; height: calc(100% - 120px); overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; }
                    .tab-content.active { display: block; }
                    #markdown-output { white-space: pre-wrap; word-wrap: break-word; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; background-color: #f9fafb; padding: 15px; border-radius: 4px; font-size: 0.9em; line-height: 1.5; }
                    #html-preview { background-color: #fff; padding: 15px; border-radius: 4px; }
                    #html-preview h1, #html-preview h2, #html-preview h3 { margin-top: 1em; margin-bottom: 0.5em; } #html-preview p { margin-bottom: 0.8em; } #html-preview img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                    .copy-button { padding: 8px 12px; margin-top: 15px; margin-bottom: 5px; background-color: #4b5563; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9em; }
                    .copy-button:hover { background-color: #374151; }
                    #refreshViewsButton { width: 100%; padding: 10px 15px; background-color: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; margin-top: auto; /* Pushes to bottom */ }
                    #refreshViewsButton:hover { background-color: #047857; }
                    .error-message { color: #dc2626; background-color: #fee2e2; padding: 12px; border: 1px solid #fca5a5; border-radius: 6px; margin-bottom: 15px; font-size: 0.9em; }
                    .selection-controls button { background-color: #6b7280; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; }
                    .selection-controls button:hover { background-color: #4b5563; }
                </style>
            </head>
            <body>
                <div id="controls">
                    <div class="url-input-container">
                        <label for="urlInput">Enter URL to Scrape:</label>
                        <input type="text" id="urlInput" value="${targetUrl ? escapeHtmlAttr(targetUrl) : ''}" placeholder="https://example.com">
                        <button id="scrapeNewUrlButton">Scrape URL</button>
                    </div>
                    
                    ${initialError ? `<div class="error-message">${initialError}</div>` : ''}

                    <div id="sections-container-wrapper">
                        <h3 id="sectionsHeader">${sectionsHeaderMsg}</h3>
                        <div id="sections-container">
                            <!-- Checkboxes will be populated here by JS -->
                        </div>
                    </div>
                    <div class="selection-controls" style="margin-top: 10px; display: flex; gap: 10px;">
                        <button id="selectAllButton" style="flex-grow: 1;">Select All</button>
                        <button id="deselectAllButton" style="flex-grow: 1;">Deselect All</button>
                    </div>
                    <button onclick="updateViews()" id="refreshViewsButton">Refresh Views</button>
                </div>

                <div id="content-display">
                    <div id="output-tabs">
                        <button class="tab-button" onclick="showTab('markdown', this)">Markdown</button>
                        <button class="tab-button active" onclick="showTab('html', this)">HTML Preview</button>
                    </div>
                    <div id="markdown" class="tab-content active">
                        <button id="copyMarkdownButton" class="copy-button">Copy Markdown</button>
                        <button id="downloadMarkdownButton" class="copy-button" style="margin-left: 10px;">Download Markdown</button>
                        <pre id="markdown-output"></pre>
                    </div>
                    <div id="html" class="tab-content">
                         <button id="copyHtmlButton" class="copy-button">Copy HTML Source</button>
                         <button id="downloadHtmlButton" class="copy-button" style="margin-left: 10px;">Download HTML</button> 
                        <div id="html-preview"></div>
                    </div>
                </div>
                
                <script type="application/json" id="scrapedJsonData">
                    ${jsonForDataScript}
                <\/script>
                <script src="/client_script.js"><\/script>
            </body>
            </html>
        `;
        res.type('text/html; charset=utf-8').send(htmlContent);
    } catch (pageGenError) {
        const cleanErrorMessage = String(pageGenError.message || 'Server error').replace(/`/g, "'");
        console.error('Error generating page:', pageGenError.message, pageGenError.stack);
        res.status(500).send('Error generating page: ' + cleanErrorMessage);
    }
});

app.get('/', (req, res) => {
    // Redirect to /markdown to allow users to input a URL or see a previously scraped one if URL is in query
    res.redirect('/markdown');
});
