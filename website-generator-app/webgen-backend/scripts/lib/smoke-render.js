'use strict';

/**
 * Runtime smoke render for AI-generated section source.
 *
 * Transpiles the section with Babel, evaluates it in a VM sandbox exposing
 * the real runtime scope (react, lucide-react, framer-motion), then renders
 * it against the section's actual contentJson via renderToStaticMarkup.
 * Any error raised here would also crash the live preview, so it is reported
 * as a validation failure and fed to the repair loop.
 */

const vm = require('vm');
const React = require('react');
const { transformSync } = require('@babel/core');
const { renderToStaticMarkup } = require('react-dom/server');
const { buildSectionSandbox } = require('./section-scope');

const runtimeError = (message) => ({ message, line: null, column: null });

/**
 * Renders the section source against contentJson and collects runtime errors.
 *
 * @param {string} source raw JSX source of the section
 * @param {object} contentJson locked content object passed as the data prop
 * @returns {object[]} validation errors (empty when the render succeeds)
 */
function runSmokeRender(source, contentJson) {
    // --- Transpile JSX to CommonJS so the VM can evaluate it
    let transpiledCode;
    try {
        const result = transformSync(source, {
            presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
            plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
            filename: 'section.jsx',
        });
        transpiledCode = result.code;
    } catch (e) {
        return [{
            message: `Babel transpile failed: ${e.message}`,
            line: e.loc?.line ?? null,
            column: e.loc?.column ?? null,
        }];
    }

    // --- Evaluate the module inside the real-dependency sandbox
    const sandbox = buildSectionSandbox();
    try {
        const script = new vm.Script(transpiledCode, { filename: 'section.jsx' });
        script.runInContext(vm.createContext(sandbox), { timeout: 2000 });
    } catch (e) {
        return [runtimeError(`VM execution failed: ${e.message}`)];
    }

    // --- The module must export a callable React component
    const Component = sandbox.module.exports.default || sandbox.module.exports;
    if (typeof Component !== 'function') {
        return [runtimeError('Transpiled module did not export a function component.')];
    }

    // --- Render with the locked contentJson exactly as production does
    try {
        renderToStaticMarkup(React.createElement(Component, { data: contentJson }));
    } catch (e) {
        return [runtimeError(`Runtime render error with contentJson: ${e.message}`)];
    }

    return [];
}

module.exports = { runSmokeRender };
