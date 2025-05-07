// client_script.js

// Retrieve and parse data from the embedded JSON data island
const jsonDataElement = document.getElementById('scrapedJsonData');
let scrapedData = {}; // Initialize as empty object
try {
    if (jsonDataElement && jsonDataElement.textContent) {
        scrapedData = JSON.parse(jsonDataElement.textContent);
    } else {
        console.warn('scrapedJsonData element not found or is empty. Proceeding with empty data.');
        scrapedData = { sections: [], imageDefinitions: [] }; // Default structure
    }
} catch (e) {
    console.error('Error parsing scrapedJsonData:', e);
    scrapedData = { sections: [], imageDefinitions: [] }; // Default structure on error
}

const sectionsContainer = document.getElementById('sections-container');
const markdownOutput = document.getElementById('markdown-output'); // This is a <pre> tag
const htmlPreview = document.getElementById('html-preview');
const urlInput = document.getElementById('urlInput');
const scrapeNewUrlButton = document.getElementById('scrapeNewUrlButton');
const copyMarkdownButton = document.getElementById('copyMarkdownButton');
const copyHtmlButton = document.getElementById('copyHtmlButton');
const selectAllButton = document.getElementById('selectAllButton'); 
const deselectAllButton = document.getElementById('deselectAllButton'); 
const downloadMarkdownButton = document.getElementById('downloadMarkdownButton'); // Added
const downloadHtmlButton = document.getElementById('downloadHtmlButton'); // Added (ensure this ID matches HTML)

let draggedItem = null; // To store the section being dragged

function showTab(tabName, clickedButton) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    const activeTabContent = document.getElementById(tabName);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    } else {
        console.error(`Tab content for '${tabName}' not found.`);
    }

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    if (clickedButton) {
        clickedButton.classList.add('active');
    } else {
        // Fallback if clickedButton is not passed, try to find it by tabName
        const correspondingButton = Array.from(tabButtons).find(btn => btn.getAttribute('onclick').includes(`showTab('${tabName}'`));
        if (correspondingButton) correspondingButton.classList.add('active');
    }
}

function initializeControls() {
    if (!scrapedData || !scrapedData.sections) {
        console.error('Scraped data or sections are missing.');
        if(sectionsContainer) sectionsContainer.innerHTML = '<p>Error: No sections data loaded or data is invalid.</p>';
        const refreshBtn = document.getElementById('refreshViewsButton');
        if(refreshBtn) refreshBtn.disabled = true;
        // Attempt to set a default tab even if data is bad
        const defaultTabButton = document.querySelector('.tab-button'); // First tab button
        if (defaultTabButton) {
            const defaultTabName = defaultTabButton.getAttribute('onclick').match(/showTab\('(.*?)'/)[1];
            if (defaultTabName) showTab(defaultTabName, defaultTabButton);
        }
        return;
    }

    if (sectionsContainer) {
        // Call renderSections to build the initial UI
        renderSections();

        // Add drag and drop event listeners to the container
        sectionsContainer.addEventListener('dragstart', handleDragStart);
        sectionsContainer.addEventListener('dragover', handleDragOver);
        sectionsContainer.addEventListener('dragleave', handleDragLeave);
        sectionsContainer.addEventListener('drop', handleDrop);
        sectionsContainer.addEventListener('dragend', handleDragEnd);

    } else {
        console.error('sectionsContainer not found');
    }
    
    updateViews(); 

    if (scrapeNewUrlButton && urlInput) {
        scrapeNewUrlButton.addEventListener('click', () => {
            const newUrl = urlInput.value.trim();
            if (newUrl) {
                if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
                    alert('Please enter a valid URL (e.g., http://example.com or https://example.com).');
                    return;
                }
                window.location.href = `/markdown?url=${encodeURIComponent(newUrl)}`;
            } else {
                alert('Please enter a URL.');
            }
        });
    } else {
        console.error('URL input or scrape button not found.');
    }

    if (copyMarkdownButton && markdownOutput) {
        copyMarkdownButton.addEventListener('click', () => {
            navigator.clipboard.writeText(markdownOutput.textContent)
                .then(() => alert('Markdown copied to clipboard!'))
                .catch(err => {
                    console.error('Failed to copy Markdown: ', err);
                    alert('Failed to copy Markdown. See console for details.');
                });
        });
    }

    if (copyHtmlButton && htmlPreview) {
        copyHtmlButton.addEventListener('click', () => {
            navigator.clipboard.writeText(htmlPreview.innerHTML)
                .then(() => alert('HTML source copied to clipboard!'))
                .catch(err => {
                    console.error('Failed to copy HTML: ', err);
                    alert('Failed to copy HTML source. See console for details.');
                });
        });
    }
    
    if (selectAllButton) {
        selectAllButton.addEventListener('click', () => {
            const checkboxes = sectionsContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = true);
            updateViews();
        });
    }

    if (deselectAllButton) {
        deselectAllButton.addEventListener('click', () => {
            const checkboxes = sectionsContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            updateViews();
        });
    }

    if (downloadMarkdownButton && markdownOutput && urlInput) {
        downloadMarkdownButton.addEventListener('click', () => {
            const markdownContent = markdownOutput.textContent;
            const currentUrl = urlInput.value;
            let filename = 'scraped_content.md'; // Default filename

            if (currentUrl) {
                try {
                    const urlObj = new URL(currentUrl);
                    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                    if (pathParts.length > 0) {
                        const lastPart = pathParts[pathParts.length - 1];
                        // Basic sanitization: replace non-alphanumeric with underscore, remove trailing .html or .htm
                        filename = lastPart.replace(/\.html?$/i, '').replace(/[^a-z0-9_\-\.]/gi, '_') + '.md';
                    }
                } catch (e) {
                    console.error('Error parsing URL for filename:', e);
                    // Keep default filename if URL parsing fails
                }
            }

            const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            alert('Markdown download initiated as ' + filename);
        });
    }

    if (downloadHtmlButton && htmlPreview && urlInput) {
        downloadHtmlButton.addEventListener('click', () => {
            const htmlContent = htmlPreview.innerHTML;
            const currentUrl = urlInput.value;
            let filename = 'scraped_content.html'; // Default filename

            if (currentUrl) {
                try {
                    const urlObj = new URL(currentUrl);
                    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                    if (pathParts.length > 0) {
                        const lastPart = pathParts[pathParts.length - 1];
                        filename = lastPart.replace(/\.html?$/i, '').replace(/[^a-z0-9_\-\.]/gi, '_') + '.html';
                    }
                } catch (e) {
                    console.error('Error parsing URL for filename:', e);
                }
            }
            // To make it a full, self-contained HTML document, we should wrap it with <html>, <head>, <body>
            // and include any necessary styles if they are not already in htmlPreview.innerHTML
            // For simplicity here, we're downloading the preview div's content directly.
            // A more robust solution would construct a full HTML document string.
            const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${filename.replace('.html', '')}</title>\n  <style>\n    body { font-family: sans-serif; margin: 20px; } \n    /* Add other critical styles from your main page if needed for standalone viewing */
  </style>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;

            const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            alert('HTML download initiated as ' + filename);
        });
    }

    window.showTab = showTab; // Make showTab globally accessible

    // Ensure a default tab is shown on load
    const defaultTabButton = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
    if (defaultTabButton) {
        const defaultTabName = defaultTabButton.getAttribute('onclick').match(/showTab\('(.*?)'/)[1];
        if (defaultTabName) showTab(defaultTabName, defaultTabButton);
    }
}

// Drag and Drop Handlers
function handleDragStart(e) {
    if (e.target.classList.contains('section-item')) {
        draggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.sectionId);
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    if (e.target.classList.contains('section-item') && e.target !== draggedItem) {
        const targetItem = e.target;
        const bounding = targetItem.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;
        // Add a class to show where it will be dropped
        if (e.clientY < offset) {
            targetItem.classList.add('drag-over-top');
            targetItem.classList.remove('drag-over-bottom');
        } else {
            targetItem.classList.add('drag-over-bottom');
            targetItem.classList.remove('drag-over-top');
        }
    } else if (draggedItem && sectionsContainer === e.target && sectionsContainer.children.length === 0) {
        // Handle dropping into an empty container (if applicable, though sections usually exist)
        sectionsContainer.classList.add('drag-over-empty');
    }
}

function handleDragLeave(e) {
    if (e.target.classList) {
        e.target.classList.remove('drag-over-top', 'drag-over-bottom');
    }
    sectionsContainer.classList.remove('drag-over-empty');
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedItem) return;

    const target = e.target.closest('.section-item');
    let droppedAtBeginning = false;

    if (target && target !== draggedItem) {
        const bounding = target.getBoundingClientRect();
        const offset = bounding.y + bounding.height / 2;
        const draggedIndex = parseInt(draggedItem.dataset.index, 10);
        let targetIndex = parseInt(target.dataset.index, 10);

        // Remove item from its original position in scrapedData.sections
        const [draggedSectionData] = scrapedData.sections.splice(draggedIndex, 1);

        // Adjust targetIndex if dragged item was before target
        if (draggedIndex < targetIndex) {
            targetIndex--; 
        }

        // Insert item at new position in scrapedData.sections
        if (e.clientY < offset) { // Dropped on top half
            scrapedData.sections.splice(targetIndex, 0, draggedSectionData);
        } else { // Dropped on bottom half
            scrapedData.sections.splice(targetIndex + 1, 0, draggedSectionData);
        }
    } else if (sectionsContainer === e.target && sectionsContainer.children.length === 0 && draggedItem) {
        // Dropping into an empty container (if it was the only item and dragged out then back)
        const [draggedSectionData] = scrapedData.sections.splice(parseInt(draggedItem.dataset.index, 10), 1);
        scrapedData.sections.push(draggedSectionData);
    } else if (!target && draggedItem) {
        // If dropped outside any specific item but within the container (e.g., at the very end)
        // This logic assumes if not a specific target, it's appended.
        // More precise logic might be needed if dropping between last item and container bottom.
        const [draggedSectionData] = scrapedData.sections.splice(parseInt(draggedItem.dataset.index, 10), 1);
        scrapedData.sections.push(draggedSectionData);
    }
    
    // Clean up classes from all items
    document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    sectionsContainer.classList.remove('drag-over-empty');

    // Re-render the sections in their new order and update views
    if (draggedItem) { // Ensure a drop actually happened that needs re-render
        renderSections();
        updateViews();
    }
    draggedItem.classList.remove('dragging');
    draggedItem = null;
}

function handleDragEnd(e) {
    if (draggedItem) { // Check if draggedItem is not null
      draggedItem.classList.remove('dragging');
    }
    document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    sectionsContainer.classList.remove('drag-over-empty');
    draggedItem = null;
}

// New function to specifically render/re-render sections based on scrapedData.sections order
function renderSections() {
    if (!sectionsContainer) return;
    sectionsContainer.innerHTML = ''; // Clear existing sections

    scrapedData.sections.forEach((section, index) => {
        const sectionItemDiv = document.createElement('div');
        sectionItemDiv.className = 'section-item';
        sectionItemDiv.setAttribute('draggable', 'true');
        sectionItemDiv.setAttribute('data-section-id', section.id);
        sectionItemDiv.setAttribute('data-index', index.toString());

        // --- Header Controls --- 
        const headerControlsDiv = document.createElement('div');
        headerControlsDiv.className = 'section-item-header-controls';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        // Ensure unique ID for checkbox if section.id might not be unique or suitable for DOM id
        checkbox.id = `checkbox-${section.id}-${index}`; 
        checkbox.value = section.id;
        checkbox.checked = String(section.header || '') !== 'Introduction'; 
        checkbox.onchange = () => updateViews(); // Simplified, direct call
        headerControlsDiv.appendChild(checkbox);

        const labelWrapper = document.createElement('div'); // Wrapper for input and suffix
        labelWrapper.className = 'section-label-wrapper';

        const headerInput = document.createElement('input');
        headerInput.type = 'text';
        headerInput.className = 'editable-header-text';
        headerInput.value = String(section.header || 'Unnamed Section');
        headerInput.setAttribute('aria-label', 'Section header');
        headerInput.onchange = (e) => {
            scrapedData.sections[index].header = e.target.value;
            updateViews();
            // Also update data-header on checkbox if it was used for labels
            checkbox.setAttribute('data-header', e.target.value);
        };
        labelWrapper.appendChild(headerInput);

        const headerSuffixSpan = document.createElement('span');
        headerSuffixSpan.className = 'section-header-suffix';
        let suffixText = '';
        if (section.level > 0) {
            suffixText = `(H${section.level})`;
        } else if (String(section.header || '') === 'Introduction') {
            suffixText = '(Intro)';
        }
        // Note: Empty Intro logic might be complex to maintain here if header changes
        headerSuffixSpan.textContent = suffixText;
        labelWrapper.appendChild(headerSuffixSpan);
        
        headerControlsDiv.appendChild(labelWrapper);
        sectionItemDiv.appendChild(headerControlsDiv);

        // --- Editable Content Area ---
        const contentTextarea = document.createElement('textarea');
        contentTextarea.className = 'editable-content-area';
        contentTextarea.setAttribute('aria-label', 'Section content');
        // Join contentMarkdown array into a string for textarea
        contentTextarea.value = Array.isArray(section.contentMarkdown) ? section.contentMarkdown.join('\n\n') : '';
        contentTextarea.onchange = (e) => {
            // Split textarea content back into an array of strings for contentMarkdown
            scrapedData.sections[index].contentMarkdown = e.target.value.split(/\n\s*\n/); // Split by one or more newlines
            updateViews();
        };
        sectionItemDiv.appendChild(contentTextarea);
        
        sectionsContainer.appendChild(sectionItemDiv);
    });
}

function updateViews() {
    if (!scrapedData || !scrapedData.sections || typeof marked === 'undefined') {
        if (typeof marked === 'undefined') console.error('marked.js library not loaded.');
        else console.error('Scraped data is invalid or sections are missing.');
        if (markdownOutput) markdownOutput.textContent = 'Error rendering content. Data missing or invalid.';
        if (htmlPreview) htmlPreview.innerHTML = '<p>Error rendering content. Data missing or invalid.</p>';
        return;
    }

    let combinedMarkdown = '';
    const selectedSectionIds = [];
    if (sectionsContainer) {
        const checkboxes = sectionsContainer.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => selectedSectionIds.push(cb.value));
    } else {
        console.error('sectionsContainer not found during updateViews');
        if (markdownOutput) markdownOutput.textContent = 'Error: UI elements missing.';
        if (htmlPreview) htmlPreview.innerHTML = '<p>Error: UI elements missing.</p>';
        return;
    }

    const relevantImageDefinitions = new Set();
    let firstSectionProcessed = false;

    if (scrapedData.sections && Array.isArray(scrapedData.sections)) {
        scrapedData.sections.forEach(section => {
            // Ensure section and section.id are valid before using .includes
            if (section && typeof section.id !== 'undefined' && selectedSectionIds.includes(String(section.id))) {
                if (firstSectionProcessed) {
                    combinedMarkdown += '\n\n'; 
                }
                
                if (section.level > 0 && section.header) {
                   combinedMarkdown += '#'.repeat(section.level) + ' ' + section.header + '\n\n';
                } 

                if (section.contentMarkdown && Array.isArray(section.contentMarkdown)) {
                    combinedMarkdown += section.contentMarkdown.join('\n\n');
                }
                firstSectionProcessed = true;
                
                if (section.imagesUsedRefs && Array.isArray(section.imagesUsedRefs)) {
                    section.imagesUsedRefs.forEach(refId => {
                        if (scrapedData.imageDefinitions && Array.isArray(scrapedData.imageDefinitions)){
                            const def = scrapedData.imageDefinitions.find(d => typeof d === 'string' && d.startsWith('[' + refId + ']:'));
                            if (def) relevantImageDefinitions.add(def);
                        }
                    });
                }
            }
        });
    }

    if (relevantImageDefinitions.size > 0) {
       combinedMarkdown += '\n\n' + Array.from(relevantImageDefinitions).join('\n');
    }

    if (markdownOutput) markdownOutput.textContent = combinedMarkdown.trim();
    else console.error('markdownOutput element not found');

    if (htmlPreview) {
        try {
           htmlPreview.innerHTML = marked.parse(combinedMarkdown.trim());
        } catch (e) {
           htmlPreview.innerHTML = '<p>Error parsing Markdown: ' + e.message + '</p>';
           console.error("Error during marked.parse:", e);
        }
    } else {
        console.error('htmlPreview element not found');
    }
}

document.addEventListener('DOMContentLoaded', initializeControls);
