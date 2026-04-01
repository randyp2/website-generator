#!/usr/bin/env node

const assert = require('node:assert');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const validatorScript = path.join(__dirname, 'validate-jsx.js');

const runValidator = (sourceOrPayload) => {
  const input = typeof sourceOrPayload === 'string'
    ? sourceOrPayload
    : JSON.stringify(sourceOrPayload);

  const result = spawnSync(process.execPath, [validatorScript], {
    input,
    encoding: 'utf8'
  });

  assert.strictEqual(
    result.status,
    0,
    `validator exited with status ${result.status}: ${result.stderr || '(no stderr)'}`
  );

  return JSON.parse(result.stdout || '{}');
};

const hasErrorContaining = (payload, text) =>
  Array.isArray(payload.errors) &&
  payload.errors.some((err) => typeof err.message === 'string' && err.message.includes(text));

const cases = [
  // --- Existing AST checks (raw string, backward compat) ---
  {
    name: 'accepts valid default export function with { data }',
    source: `
      export default function Hero({ data }) {
        return <section>{data.title}</section>;
      }
    `,
    valid: true
  },
  {
    name: 'rejects identifier parameter (props) — must destructure { data }',
    source: `
      const Hero = (props) => <section>{props.data && props.data.title}</section>;
      export default Hero;
    `,
    valid: false,
    errorIncludes: 'must destructure { data }'
  },
  {
    name: 'rejects missing default export',
    source: `
      export const Hero = ({ data }) => <section>{data.title}</section>;
    `,
    valid: false,
    errorIncludes: 'Missing default export'
  },
  {
    name: 'rejects default export that is not a function component',
    source: `
      const value = 42;
      export default value;
    `,
    valid: false,
    errorIncludes: 'Default export must be a function component'
  },
  {
    name: 'rejects default export function without parameters',
    source: `
      export default function Hero() {
        return <section>Hello</section>;
      }
    `,
    valid: false,
    errorIncludes: 'has no parameters'
  },
  {
    name: 'rejects object destructuring without data',
    source: `
      export default function Hero({ title }) {
        return <section>{title}</section>;
      }
    `,
    valid: false,
    errorIncludes: 'does not include { data }'
  },
  {
    name: 'rejects data.contentJson usage',
    source: `
      export default function Hero({ data }) {
        return <section>{data.contentJson.title}</section>;
      }
    `,
    valid: false,
    errorIncludes: 'Do not use data.contentJson'
  },

  // --- Runtime smoke render tests (JSON payload) ---
  {
    name: 'runtime: passes when reactSource matches contentJson',
    source: {
      reactSource: `export default function Hero({ data }) { return <section><h1>{data.name}</h1></section>; }`,
      contentJson: { name: 'John Doe' }
    },
    valid: true
  },
  {
    name: 'runtime: fails when reactSource accesses missing contentJson field',
    source: {
      reactSource: `export default function Hero({ data }) { return <section><h1>{data.name.split('').join('-')}</h1></section>; }`,
      contentJson: { tagline: 'Developer' }
    },
    valid: false,
    errorIncludes: 'Runtime render error'
  },
  {
    name: 'runtime: passes with motion stub',
    source: {
      reactSource: `export default function Hero({ data }) { return <motion.div initial={{opacity:0}} animate={{opacity:1}}><h1>{data.title}</h1></motion.div>; }`,
      contentJson: { title: 'Hello World' }
    },
    valid: true
  },
  {
    name: 'runtime: passes with icon stubs',
    source: {
      reactSource: `export default function Contact({ data }) { return <section><Mail /><span>{data.email}</span></section>; }`,
      contentJson: { email: 'test@example.com' }
    },
    valid: true
  },
  {
    name: 'runtime: fails on .map() of non-array field',
    source: {
      reactSource: `export default function Skills({ data }) { return <section>{data.items.map(function(item, i) { return <span key={i}>{item}</span>; })}</section>; }`,
      contentJson: { items: 'not-an-array' }
    },
    valid: false,
    errorIncludes: 'Runtime render error'
  },
  {
    name: 'runtime: passes with AnimatePresence stub',
    source: {
      reactSource: `export default function Hero({ data }) { return <AnimatePresence><motion.section><h1>{data.title}</h1></motion.section></AnimatePresence>; }`,
      contentJson: { title: 'Test' }
    },
    valid: true
  },
];

let failures = 0;

for (const testCase of cases) {
  const payload = runValidator(testCase.source);
  const isValid = payload.valid === true;

  try {
    assert.strictEqual(isValid, testCase.valid, `${testCase.name}: expected valid=${testCase.valid}`);

    if (testCase.errorIncludes) {
      assert.ok(
        hasErrorContaining(payload, testCase.errorIncludes),
        `${testCase.name}: expected an error containing "${testCase.errorIncludes}", got ${JSON.stringify(payload.errors)}`
      );
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL: ${testCase.name}`);
    console.error(error.message);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`All ${cases.length} validator tests passed.`);
