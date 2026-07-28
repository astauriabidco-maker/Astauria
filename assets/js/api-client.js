/* Astauria public API client */
(function (global) {
    'use strict';

    const localHosts = new Set(['localhost', '127.0.0.1', '::1', '']);
    const isLocal = localHosts.has(global.location.hostname);
    const baseUrl = isLocal ? 'http://localhost:3001/api' : '/api';

    async function createLead(payload) {
        const response = await fetch(`${baseUrl}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let message = 'La demande n’a pas pu être envoyée.';

            try {
                const errorPayload = await response.json();
                if (typeof errorPayload.message === 'string') {
                    message = errorPayload.message;
                }
            } catch (_) {
                // Keep the user-friendly fallback when the API does not return JSON.
            }

            throw new Error(message);
        }

        return response.json().catch(() => ({}));
    }

    global.AstauriaApi = Object.freeze({
        baseUrl,
        createLead
    });
})(window);
