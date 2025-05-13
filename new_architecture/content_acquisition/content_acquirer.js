// Fetches raw content from a given source
// const axios = require('axios'); // No longer using axios

class ContentAcquirer {
    constructor(timeout = 10000, maxRedirects = 5) { // maxRedirects is noted but fetch handles redirects by default.
        this.timeout = timeout;
        // maxRedirects is not directly configurable in the same way with fetch's default redirect: 'follow'.
        // Node's fetch follows up to 20 redirects by default.
        // If specific control over number of redirects is needed, it would require manual handling
        // or a library that wraps fetch to provide this. For now, we'll rely on fetch's default.
    }

    _isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    async fetchContent(url) {
        if (!this._isValidHttpUrl(url)) {
            throw new Error(`Invalid URL format: ${url}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                // redirect: 'follow' is the default, so no need to specify for up to 20 redirects.
            });

            clearTimeout(timeoutId);

            const responseText = await response.text(); // Get response body as text

            if (!response.ok) {
                // Handles HTTP errors (e.g., 404, 500)
                return {
                    success: false,
                    content: responseText, // Content might still be useful (e.g., error page HTML)
                    status: response.status,
                    error: `HTTP error! status: ${response.status}`,
                    finalUrl: response.url, // final URL after redirects
                };
            }

            return {
                success: true,
                content: responseText,
                status: response.status,
                error: null,
                finalUrl: response.url, // final URL after redirects
            };
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    content: null,
                    status: null,
                    error: `timeout of ${this.timeout}ms exceeded`,
                    finalUrl: url,
                };
            }
            // Handles network errors or other issues during fetch
            return {
                success: false,
                content: null,
                status: null,
                error: error.message,
                finalUrl: url,
            };
        }
    }
}

module.exports = ContentAcquirer;
