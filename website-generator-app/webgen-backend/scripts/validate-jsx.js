#!/usr/bin/env node
const parser = require('@babel/parser');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    try {
        parser.parse(input, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'objectRestSpread']
        });
        process.stdout.write(JSON.stringify({ valid: true, errors: [] }));
        process.exit(0);
    } catch (e) {
        const error = {
            message: e.message,
            line: e.loc?.line ?? null,
            column: e.loc?.column ?? null
        };
        process.stdout.write(JSON.stringify({ valid: false, errors: [error] }));
        process.exit(0); // Exit 0 so Java doesn't treat as process failure
    }
});
