'use strict';

/**
 * Static AST checks for AI-generated section source.
 *
 * These checks enforce the parts of the section contract that are cheap to
 * verify deterministically, so contract violations fail validation (and enter
 * the repair loop) instead of relying on prompt instructions alone.
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { LUCIDE_ICON_NAMES } = require('./section-scope');

const ICON_NAMES = new Set(LUCIDE_ICON_NAMES);

const errorAt = (message, node) => ({
    message,
    line: node?.loc?.start?.line ?? null,
    column: node?.loc?.start?.column ?? null,
});

/**
 * Parses the section source as a JSX module.
 *
 * @param {string} reactSource raw JSX source
 * @returns {{ast: object|null, error: object|null}} parsed AST or a parse error
 */
function parseSectionSource(reactSource) {
    try {
        const ast = parser.parse(reactSource, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'objectRestSpread'],
        });
        return { ast, error: null };
    } catch (e) {
        return {
            ast: null,
            error: {
                message: e.message,
                line: e.loc?.line ?? null,
                column: e.loc?.column ?? null,
            },
        };
    }
}

// --- Default export must be a function component destructuring exactly { data }
function checkDefaultExportContract(ast, errors) {
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
                const binding = path.scope.getBinding(decl.name);
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
        },
    });

    if (!hasDefaultExport) {
        errors.push(errorAt('Missing default export. Each section must export a default React component.', null));
        return;
    }
    if (!defaultExportFuncNode) {
        errors.push(errorAt(
            'Default export must be a function component (function declaration, function expression, or arrow function).',
            null,
        ));
        return;
    }

    const params = defaultExportFuncNode.params;
    if (!params || params.length === 0) {
        errors.push(errorAt(
            'Default export function must accept { data } as its parameter, but has no parameters.',
            defaultExportFuncNode,
        ));
        return;
    }

    const firstParam = params[0];
    if (firstParam.type !== 'ObjectPattern') {
        errors.push(errorAt(
            'Default export function must destructure { data } in its parameter list (for example, export default function Name({ data }) { ... }).',
            firstParam,
        ));
        return;
    }

    const hasData = firstParam.properties.some(
        (prop) => prop.type === 'ObjectProperty' && prop.key && prop.key.name === 'data',
    );
    const hasExtraProps = firstParam.properties.some((prop) => {
        if (prop.type === 'RestElement') return true;
        if (prop.type !== 'ObjectProperty') return true;
        return !(prop.key && prop.key.name === 'data');
    });

    if (!hasData) {
        errors.push(errorAt(
            'Default export function destructures its parameter but does not include { data }. The component must receive data as a prop.',
            firstParam,
        ));
    }
    if (hasExtraProps) {
        errors.push(errorAt(
            'Default export function may only accept { data } as props. Remove additional props from the parameter list.',
            firstParam,
        ));
    }
}

// --- `data` may only be referenced where a binding provides it
function checkUnboundDataReferences(ast, errors) {
    let firstUnboundRef = null;

    traverse(ast, {
        Identifier(path) {
            if (firstUnboundRef) return;
            if (path.node.name !== 'data') return;
            if (!path.isReferencedIdentifier()) return;

            if (!path.scope.getBinding('data')) {
                firstUnboundRef = path.node;
            }
        },
    });

    if (firstUnboundRef) {
        errors.push(errorAt(
            'Identifier `data` is referenced but not defined in scope. Ensure the component receives `data` (for example, export default function Name({ data }) { ... }).',
            firstUnboundRef,
        ));
    }
}

// --- The data prop IS the contentJson object; nested access is always a bug
function checkContentJsonAccess(ast, errors) {
    traverse(ast, {
        MemberExpression(path) {
            const { object, property } = path.node;
            if (object.type === 'Identifier' && object.name === 'data' && property.name === 'contentJson') {
                errors.push(errorAt(
                    'Do not use data.contentJson — the data prop IS the contentJson object. Access fields directly (e.g., data.brand, data.navItems).',
                    path.node,
                ));
            }
        },
    });
}

// --- Icons are forwardRef components: calling them as functions crashes at
// --- runtime against the real lucide-react, so reject the pattern statically
function checkIconCallExpressions(ast, errors) {
    traverse(ast, {
        CallExpression(path) {
            const callee = path.node.callee;
            if (callee.type !== 'Identifier') return;
            if (!ICON_NAMES.has(callee.name)) return;

            // A local binding shadows the injected icon; calling it is the author's business.
            if (path.scope.getBinding(callee.name)) return;

            errors.push(errorAt(
                `Lucide icon '${callee.name}' is a React component and must be rendered as a JSX element `
                + `(e.g., <${callee.name} className="w-4 h-4" />), never called as a function like ${callee.name}({ ... }).`,
                path.node,
            ));
        },
    });
}

/**
 * Runs all static checks against a section source string.
 *
 * @param {string} reactSource raw JSX source
 * @returns {{ast: object|null, errors: object[]}} parsed AST (null on parse failure) and collected errors
 */
function runAstChecks(reactSource) {
    const { ast, error } = parseSectionSource(reactSource);
    if (!ast) {
        return { ast: null, errors: [error] };
    }

    const errors = [];
    checkDefaultExportContract(ast, errors);
    checkUnboundDataReferences(ast, errors);
    checkContentJsonAccess(ast, errors);
    checkIconCallExpressions(ast, errors);

    return { ast, errors };
}

module.exports = { runAstChecks };
