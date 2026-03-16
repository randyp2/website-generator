#!/usr/bin/env node
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const errors = [];

    let ast;
    try {
        ast = parser.parse(input, {
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
        process.exit(0); // Exit 0 so Java doesn't treat as process failure
    }

    // --- Find the default export and validate { data } param ---
    let defaultExportFuncNode = null;

    traverse(ast, {
        // Pattern 1: export default function Foo({ data }) { ... }
        ExportDefaultDeclaration(path) {
            const decl = path.node.declaration;
            if (decl.type === 'FunctionDeclaration') {
                defaultExportFuncNode = decl;
            } else if (decl.type === 'Identifier') {
                // Pattern 2 & 3: export default Foo (where Foo is declared elsewhere)
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

    if (defaultExportFuncNode) {
        const params = defaultExportFuncNode.params;
        if (!params || params.length === 0) {
            errors.push({
                message: 'Default export function must accept { data } as its parameter, but has no parameters.',
                line: defaultExportFuncNode.loc?.start?.line ?? null,
                column: defaultExportFuncNode.loc?.start?.column ?? null
            });
        } else {
            const firstParam = params[0];
            if (firstParam.type === 'ObjectPattern') {
                const hasData = firstParam.properties.some(
                    prop => prop.type === 'ObjectProperty' && prop.key && prop.key.name === 'data'
                );
                if (!hasData) {
                    errors.push({
                        message: 'Default export function destructures its parameter but does not include { data }. The component must receive data as a prop.',
                        line: firstParam.loc?.start?.line ?? null,
                        column: firstParam.loc?.start?.column ?? null
                    });
                }
            }
            // If it's a plain Identifier (e.g. `props`), we allow it — they can do props.data
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

    if (errors.length > 0) {
        process.stdout.write(JSON.stringify({ valid: false, errors }));
    } else {
        process.stdout.write(JSON.stringify({ valid: true, errors: [] }));
    }
    process.exit(0);
});
