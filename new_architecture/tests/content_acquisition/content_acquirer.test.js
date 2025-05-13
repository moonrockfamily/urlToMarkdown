const ContentAcquirer = require('../../content_acquisition/content_acquirer');

// Mock global.fetch
global.fetch = jest.fn();

// Mock AbortController
const mockAbort = jest.fn();
global.AbortController = jest.fn(() => ({
  abort: mockAbort,
  signal: { aborted: false } // Provide a basic signal object
}));

describe('ContentAcquirer', () => {
    let contentAcquirer;
    const expectedTimeout = 10000; // Default timeout in ContentAcquirer

    beforeEach(() => {
        contentAcquirer = new ContentAcquirer(expectedTimeout);
        global.fetch.mockClear();
        mockAbort.mockClear();
        // Clear any timers mocked by Jest if we start using them
        // jest.clearAllTimers();
        // Reset AbortController mock if necessary, or ensure signal is fresh
        global.AbortController.mockClear();
        global.AbortController.mockImplementation(() => ({
            abort: mockAbort,
            signal: {aborted: false} // ensure signal is not aborted initially
        }));
    });

    test('should fetch content successfully from a valid URL', async () => {
        const mockHtml = '<html><body><h1>Hello World</h1></body></html>';
        const url = 'http://example.com';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => mockHtml,
            url: url, // final URL after potential redirects
        });

        const result = await contentAcquirer.fetchContent(url);

        expect(global.fetch).toHaveBeenCalledWith(url, { signal: expect.any(Object) });
        expect(result).toEqual({
            success: true,
            content: mockHtml,
            status: 200,
            error: null,
            finalUrl: url
        });
    });

    test('should handle network errors when fetching content', async () => {
        const url = 'http://example.com/nonexistent';
        const networkError = new Error('Network Error');
        global.fetch.mockRejectedValueOnce(networkError);

        const result = await contentAcquirer.fetchContent(url);

        expect(global.fetch).toHaveBeenCalledWith(url, { signal: expect.any(Object) });
        expect(result).toEqual({
            success: false,
            content: null,
            status: null,
            error: 'Network Error',
            finalUrl: url
        });
    });

    test('should handle HTTP errors (e.g., 404)', async () => {
        const url = 'http://example.com/notfound';
        const errorContent = 'Not Found Page';
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            text: async () => errorContent,
            url: url,
        });

        const result = await contentAcquirer.fetchContent(url);

        expect(global.fetch).toHaveBeenCalledWith(url, { signal: expect.any(Object) });
        expect(result).toEqual({
            success: false,
            content: errorContent,
            status: 404,
            error: 'HTTP error! status: 404',
            finalUrl: url
        });
    });

    test('should handle timeouts', async () => {
        const url = 'http://example.com/slow';
        const abortError = new Error('The operation was aborted.');
        abortError.name = 'AbortError';
        global.fetch.mockRejectedValueOnce(abortError);
        
        // We can also advance timers if we were using jest.useFakeTimers()
        // jest.advanceTimersByTime(expectedTimeout);

        const result = await contentAcquirer.fetchContent(url);

        expect(global.fetch).toHaveBeenCalledWith(url, { signal: expect.any(Object) });
        // expect(mockAbort).toHaveBeenCalled(); // Verify AbortController.abort() was called
        expect(result).toEqual({
            success: false,
            content: null,
            status: null,
            error: `timeout of ${expectedTimeout}ms exceeded`,
            finalUrl: url
        });
    });

    test('should throw error for invalid URL format', async () => {
        const invalidUrl = 'not_a_url';
        await expect(contentAcquirer.fetchContent(invalidUrl))
            .rejects
            .toThrow('Invalid URL format: not_a_url');
        expect(global.fetch).not.toHaveBeenCalled();
    });
    
    test('should follow redirects and return the final URL', async () => {
        const initialUrl = 'http://example.com/initial';
        const finalUrl = 'http://example.com/final';
        const mockHtml = '<html><body><h1>Final Page</h1></body></html>';

        global.fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            text: async () => mockHtml,
            url: finalUrl, // fetch provides the final URL after redirects
        });
        
        const result = await contentAcquirer.fetchContent(initialUrl);
        
        expect(global.fetch).toHaveBeenCalledWith(initialUrl, { signal: expect.any(Object) });
        expect(result).toEqual({
            success: true,
            content: mockHtml,
            status: 200,
            error: null,
            finalUrl: finalUrl
        });
    });

    // Test for AbortController being called on timeout
    test('should call AbortController.abort on timeout', async () => {
        jest.useFakeTimers(); // Use fake timers for this test

        const url = 'http://example.com/very-slow';
        // The AbortError will be created by the mock for fetch or by fetch itself.
        // The ContentAcquirer expects an error with .name === 'AbortError'

        // Make fetch simulate a long-running request that will be aborted by its own internal timer
        // This simulates that the fetch operation itself recognized the abort signal or timed out internally in a way that produces an AbortError.
        global.fetch.mockImplementationOnce(() => 
            new Promise((_resolve, reject) => {
                const abortErrorForMock = new Error('Mocked fetch operation aborted.');
                abortErrorForMock.name = 'AbortError';
                // This timer simulates the fetch operation taking longer than the controller's timeout,
                // and then aborting.
                setTimeout(() => reject(abortErrorForMock), expectedTimeout + 100); 
            })
        );
        
        const fetchPromise = contentAcquirer.fetchContent(url);
        
        // Advance timers to trigger the timeout in ContentAcquirer, which calls controller.abort()
        jest.advanceTimersByTime(expectedTimeout);

        // Crucially, run any remaining timers. This allows the setTimeout within the fetch mock to execute,
        // causing the fetchPromise to reject.
        jest.runAllTimers();

        await expect(fetchPromise).resolves.toEqual(expect.objectContaining({
            success: false,
            error: `timeout of ${expectedTimeout}ms exceeded`,
        }));
        
        expect(mockAbort).toHaveBeenCalled(); // Check if AbortController's abort was called

        jest.useRealTimers(); // Restore real timers
    });
});
