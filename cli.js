const fs = require('fs');
const { scrapeToMarkdown } = require('./scraper_core');

async function runCli() {
    const cliUrl = process.argv[2];
    const cliOutputFilePath = process.argv[3]; // Optional output file path argument

    if (!cliUrl) {
        console.error('CLI Usage: node cli.js <URL> [OutputFilePath]');
        process.exit(1);
    }

    console.log(`CLI mode: Scraping ${cliUrl}`);

    try {
        const markdown = await scrapeToMarkdown(cliUrl);
        const finalOutputFilePath = cliOutputFilePath || `scraped_markdown_${new URL(cliUrl).hostname.replace(/\./g, '_')}.md`;
        fs.writeFileSync(finalOutputFilePath, markdown, 'utf8');
        console.log(`CLI: Markdown with embedded images saved to: ${finalOutputFilePath}`);
    } catch (error) {
        console.error('CLI Error:', error.message);
        process.exit(1); // Exit with error code for CLI failures
    }
}

runCli();
