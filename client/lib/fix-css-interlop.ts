// lib/fix-css-interop.ts
if (typeof global !== 'undefined') {
    const _warn = console.warn.bind(console);
    console.warn = (...args: any[]) => {
        const msg = args[0];
        if (typeof msg === 'string' && msg.includes('upgrade')) return;
        _warn(...args);
    };
}