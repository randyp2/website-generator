#!/usr/bin/env node
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { transformSync } = require('@babel/core');
const vm = require('vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// --- Runtime smoke render ---
function runSmokeRender(source, contentJson) {
    const errors = [];

    let transpiledCode;
    try {
        const result = transformSync(source, {
            presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
            plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
            filename: 'section.jsx',
        });
        transpiledCode = result.code;
    } catch (e) {
        errors.push({
            message: `Babel transpile failed: ${e.message}`,
            line: e.loc?.line ?? null,
            column: e.loc?.column ?? null,
        });
        return errors;
    }

    const moduleExports = {};
    const iconStub = (props) => React.createElement('span', null);

    const motionProxy = new Proxy(() => null, {
        get(_target, prop) {
            if (prop === '$$typeof' || prop === 'render' || prop === '_payload' || prop === '_init') return undefined;
            if (prop === 'AnimatePresence') {
                return ({ children }) => React.createElement(React.Fragment, null, children);
            }
            return React.forwardRef((props, ref) => {
                const { children } = props || {};
                return React.createElement('div', null, children);
            });
        },
        apply() {
            return React.forwardRef((props, ref) => {
                const { children } = props || {};
                return React.createElement('div', null, children);
            });
        }
    });

    const sandbox = {
        module: { exports: moduleExports },
        exports: moduleExports,
        React,
        motion: motionProxy,
        AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
        Mail: iconStub,
        Phone: iconStub,
        MapPin: iconStub,
        Globe: iconStub,
        Github: iconStub,
        Linkedin: iconStub,
        ArrowUpRight: iconStub,
        console: { log: () => {}, warn: () => {}, error: () => {} },
    };

    try {
        const script = new vm.Script(transpiledCode, { filename: 'section.jsx' });
        const context = vm.createContext(sandbox);
        script.runInContext(context, { timeout: 2000 });
    } catch (e) {
        errors.push({
            message: `VM execution failed: ${e.message}`,
            line: null,
            column: null,
        });
        return errors;
    }

    const Component = sandbox.module.exports.default || sandbox.module.exports;
    if (typeof Component !== 'function') {
        errors.push({
            message: 'Transpiled module did not export a function component.',
            line: null,
            column: null,
        });
        return errors;
    }

    try {
        renderToStaticMarkup(React.createElement(Component, { data: contentJson }));
    } catch (e) {
        errors.push({
            message: `Runtime render error with contentJson: ${e.message}`,
            line: null,
            column: null,
        });
    }

    return errors;
}

// --- Main ---
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const errors = [];

    // Parse input: JSON payload or raw JSX (backward compat)
    let reactSource;
    let contentJson = null;
    try {
        const payload = JSON.parse(input);
        if (payload.reactSource) {
            reactSource = payload.reactSource;
            contentJson = payload.contentJson || null;
        } else {
            reactSource = input;
        }
    } catch {
        reactSource = input;
    }

    let ast;
    try {
        ast = parser.parse(reactSource, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'objectRestSpread']
        });
    } catch (e) {
        const error = {
            message: e.message,
            line: e.loc?.line ?? null,
            column: e.loc?.column ?? null
        };
        process.stdout.write(JSON.stringify({ valid: false, errors: [error] }));
        process.exit(0);
    }

    // --- Find the default export and validate { data } param ---
    let defaultExportFuncNode = null;
    let hasDefaultExport = false;

    traverse(ast, {
        ExportDefaultDeclaration(path) {
            hasDefaultExport = true;
            const decl = path.node.declaration;

            if (
                decl.type === 'FunctionDeclaration' ||
                decl.type === 'FunctionExpression' ||
                decl.type === 'ArrowFunctionExpression'
            ) {
                defaultExportFuncNode = decl;
            } else if (decl.type === 'Identifier') {
                const name = decl.name;
                const binding = path.scope.getBinding(name);
                if (binding) {
                    const bindingNode = binding.path.node;
                    if (bindingNode.type === 'FunctionDeclaration') {
                        defaultExportFuncNode = bindingNode;
                    } else if (bindingNode.type === 'VariableDeclarator' && bindingNode.init) {
                        const init = bindingNode.init;
                        if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') {
                            defaultExportFuncNode = init;
                        }
                    }
                }
            }
        }
    });

    if (!hasDefaultExport) {
        errors.push({
            message: 'Missing default export. Each section must export a default React component.',
            line: null,
            column: null
        });
    } else if (!defaultExportFuncNode) {
        errors.push({
            message: 'Default export must be a function component (function declaration, function expression, or arrow function).',
            line: null,
            column: null
        });
    } else {
        const params = defaultExportFuncNode.params;
        if (!params || params.length === 0) {
            errors.push({
                message: 'Default export function must accept { data } as its parameter, but has no parameters.',
                line: defaultExportFuncNode.loc?.start?.line ?? null,
                column: defaultExportFuncNode.loc?.start?.column ?? null
            });
        } else {
            const firstParam = params[0];
            if (firstParam.type !== 'ObjectPattern') {
                errors.push({
                    message: 'Default export function must destructure { data } in its parameter list (for example, export default function Name({ data }) { ... }).',
                    line: firstParam.loc?.start?.line ?? null,
                    column: firstParam.loc?.start?.column ?? null
                });
            } else {
                const hasData = firstParam.properties.some(
                    prop => prop.type === 'ObjectProperty' && prop.key && prop.key.name === 'data'
                );
                const hasExtraProps = firstParam.properties.some(prop => {
                    if (prop.type === 'RestElement') return true;
                    if (prop.type !== 'ObjectProperty') return true;
                    return !(prop.key && prop.key.name === 'data');
                });

                if (!hasData) {
                    errors.push({
                        message: 'Default export function destructures its parameter but does not include { data }. The component must receive data as a prop.',
                        line: firstParam.loc?.start?.line ?? null,
                        column: firstParam.loc?.start?.column ?? null
                    });
                }
                if (hasExtraProps) {
                    errors.push({
                        message: 'Default export function may only accept { data } as props. Remove additional props from the parameter list.',
                        line: firstParam.loc?.start?.line ?? null,
                        column: firstParam.loc?.start?.column ?? null
                    });
                }
            }
        }
    }

    // --- Flag unbound `data` identifier references ---
    if (ast) {
        const unboundDataRefs = [];
        traverse(ast, {
            Identifier(path) {
                if (path.node.name !== 'data') return;
                if (!path.isReferencedIdentifier()) return;

                const binding = path.scope.getBinding('data');
                if (!binding) {
                    unboundDataRefs.push({
                        line: path.node.loc?.start?.line ?? null,
                        column: path.node.loc?.start?.column ?? null
                    });
                }
            }
        });

        if (unboundDataRefs.length > 0) {
            const first = unboundDataRefs[0];
            errors.push({
                message: 'Identifier `data` is referenced but not defined in scope. Ensure the component receives `data` (for example, export default function Name({ data }) { ... }).',
                line: first.line,
                column: first.column
            });
        }
    }

    // --- Flag data.contentJson access (data IS contentJson, no nesting) ---
    if (ast) {
        traverse(ast, {
            MemberExpression(path) {
                const { object, property } = path.node;
                if (
                    object.type === 'Identifier' &&
                    object.name === 'data' &&
                    property.name === 'contentJson'
                ) {
                    errors.push({
                        message: 'Do not use data.contentJson — the data prop IS the contentJson object. Access fields directly (e.g., data.brand, data.navItems).',
                        line: path.node.loc?.start?.line ?? null,
                        column: path.node.loc?.start?.column ?? null
                    });
                }
            }
        });
    }

    // --- Runtime smoke render (only if AST checks passed and contentJson provided) ---
    if (errors.length === 0 && contentJson !== null) {
        try {
            const runtimeErrors = runSmokeRender(reactSource, contentJson);
            errors.push(...runtimeErrors);
        } catch (e) {
            errors.push({
                message: `Runtime smoke render failed: ${e.message}`,
                line: null,
                column: null
            });
        }
    }

    if (errors.length > 0) {
        process.stdout.write(JSON.stringify({ valid: false, errors }));
    } else {
        process.stdout.write(JSON.stringify({ valid: true, errors: [] }));
    }
    process.exit(0);
});
