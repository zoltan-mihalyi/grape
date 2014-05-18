define([], function () {
    return {
        browser: typeof window !== 'undefined',
        node: typeof process === 'object' && typeof process.env === 'object'
    };
});