#!/usr/bin/env node
'use strict';

/**
 * Entry point for section validation, invoked by JsxValidatorService via
 * stdin/stdout.
 *
 * Input: JSON payload { reactSource, contentJson } or a raw JSX string
 * (backward compat). Output: JSON { valid, errors } on stdout, always with
 * exit code 0 so the caller distinguishes validation failures from process
 * failures.
 *
 * Validation runs two phases:
 *   1. Static AST checks (lib/ast-checks.js) for the section contract
 *   2. A runtime smoke render (lib/smoke-render.js) against the REAL runtime
 *      dependencies, so anything that would crash the preview fails here first
 */

const { runAstChecks } = require('./lib/ast-checks');
const { runSmokeRender } = require('./lib/smoke-render');

const writeResult = (errors) => {
    process.stdout.write(JSON.stringify({ valid: errors.length === 0, errors }));
    process.exit(0);
};

const parseInputPayload = (input) => {
    try {
        const payload = JSON.parse(input);
        if (payload.reactSource) {
            return { reactSource: payload.reactSource, contentJson: payload.contentJson ?? null };
        }
    } catch {
        // Not JSON: treat the whole input as raw JSX source
    }
    return { reactSource: input, contentJson: null };
};

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
    const { reactSource, contentJson } = parseInputPayload(input);

    const { errors } = runAstChecks(reactSource);

    // --- Smoke render only when static checks pass and content is available
    if (errors.length === 0 && contentJson !== null) {
        try {
            errors.push(...runSmokeRender(reactSource, contentJson));
        } catch (e) {
            errors.push({
                message: `Runtime smoke render failed: ${e.message}`,
                line: null,
                column: null,
            });
        }
    }

    writeResult(errors);
});
