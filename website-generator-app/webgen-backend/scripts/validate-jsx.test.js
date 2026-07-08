#!/usr/bin/env node
'use strict';

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
  // --- Static AST checks (raw string, backward compat) ---
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

  // --- Icon call checks: icons are forwardRef components, not functions ---
  {
    name: 'rejects lucide icon called as a function',
    source: `
      export default function Contact({ data }) {
        return (
          <section>
            {MapPin({ className: 'w-4 h-4' })}
            <span>{data.location}</span>
          </section>
        );
      }
    `,
    valid: false,
    errorIncludes: 'must be rendered as a JSX element'
  },
  {
    name: 'rejects icon call nested inside JSX attributes and children',
    source: `
      export default function Links({ data }) {
        return <a href={data.url}>{ArrowUpRight({ size: 16 })}</a>;
      }
    `,
    valid: false,
    errorIncludes: "Lucide icon 'ArrowUpRight'"
  },
  {
    name: 'accepts a locally shadowed identifier sharing an icon name',
    source: `
      export default function Hero({ data }) {
        const Star = (props) => <span>{props.label}</span>;
        return <section>{Star({ label: data.title })}</section>;
      }
    `,
    valid: true
  },

  // --- Runtime smoke render against the real dependencies (JSON payload) ---
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
    name: 'runtime: passes with real framer-motion',
    source: {
      reactSource: `export default function Hero({ data }) { return <motion.div initial={{opacity:0}} animate={{opacity:1}}><h1>{data.title}</h1></motion.div>; }`,
      contentJson: { title: 'Hello World' }
    },
    valid: true
  },
  {
    name: 'runtime: passes with real lucide icons rendered as JSX',
    source: {
      reactSource: `export default function Contact({ data }) { return <section><Mail className="w-4 h-4" /><MapPin className="w-4 h-4" /><span>{data.email}</span></section>; }`,
      contentJson: { email: 'test@example.com' }
    },
    valid: true
  },
  {
    name: 'runtime: passes with extended icon set beyond the prompt whitelist',
    source: {
      reactSource: `export default function Skills({ data }) { return <section><Star /><Briefcase /><GraduationCap /><span>{data.title}</span></section>; }`,
      contentJson: { title: 'Skills' }
    },
    valid: true
  },
  {
    name: 'runtime: passes with react hooks in scope',
    source: {
      reactSource: `export default function Tabs({ data }) { const [active, setActive] = useState(0); return <section><button onClick={() => setActive(1)}>{data.items[active]}</button></section>; }`,
      contentJson: { items: ['One', 'Two'] }
    },
    valid: true
  },
  {
    name: 'runtime: passes with framer-motion hooks in scope',
    source: {
      reactSource: `export default function Hero({ data }) { const ref = useRef(null); const inView = useInView(ref); return <section ref={ref} data-visible={inView}><h1>{data.title}</h1></section>; }`,
      contentJson: { title: 'Hello' }
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
    name: 'runtime: passes with real AnimatePresence',
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
