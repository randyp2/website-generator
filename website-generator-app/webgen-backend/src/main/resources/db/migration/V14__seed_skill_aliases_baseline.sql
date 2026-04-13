-- Flyway V14: Seed skill aliases baseline.
-- Source: seed/skills.v1.json
-- Generated: 2026-04-13
--
-- Uses WHERE NOT EXISTS on lower(alias) to avoid violating the
-- unique index skill_aliases_alias_lower_key.
-- Future additions must go in new migration files (V15+, etc.).

-- ════════════════════════════════════════════════════════════════════
-- ENGINEERING ALIASES (271 aliases for 150 skills)
-- ════════════════════════════════════════════════════════════════════

-- JavaScript
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', 'ECMAScript'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ECMAScript')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', 'ES6'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ES6')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', 'ES2015+'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ES2015+')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001', 'Vanilla JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vanilla JS')
);

-- TypeScript
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000002', 'TS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TS')
);

-- Python
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000003', 'Python 3'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Python 3')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000008', '10000000-0000-4000-a000-000000000003', 'Python3'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Python3')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000009', '10000000-0000-4000-a000-000000000003', 'CPython'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CPython')
);

-- Java
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000a', '10000000-0000-4000-a000-000000000004', 'Java SE'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Java SE')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000b', '10000000-0000-4000-a000-000000000004', 'Java EE'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Java EE')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000c', '10000000-0000-4000-a000-000000000004', 'J2EE'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('J2EE')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000d', '10000000-0000-4000-a000-000000000004', 'Core Java'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Core Java')
);

-- C#
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000e', '10000000-0000-4000-a000-000000000005', 'CSharp'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CSharp')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000000f', '10000000-0000-4000-a000-000000000005', 'C Sharp'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C Sharp')
);

-- C++
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000010', '10000000-0000-4000-a000-000000000006', 'CPP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CPP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000006', 'C Plus Plus'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C Plus Plus')
);

-- C
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000007', 'C Language'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C Language')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000013', '10000000-0000-4000-a000-000000000007', 'ANSI C'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ANSI C')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000014', '10000000-0000-4000-a000-000000000007', 'C99'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C99')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000015', '10000000-0000-4000-a000-000000000007', 'C11'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C11')
);

-- Go
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000016', '10000000-0000-4000-a000-000000000008', 'Golang'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Golang')
);

-- Rust
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000017', '10000000-0000-4000-a000-000000000009', 'Rust Lang'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rust Lang')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000018', '10000000-0000-4000-a000-000000000009', 'Rustlang'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rustlang')
);

-- Ruby
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000019', '10000000-0000-4000-a000-00000000000a', 'Ruby Language'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ruby Language')
);

-- PHP
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001a', '10000000-0000-4000-a000-00000000000b', 'PHP 8'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PHP 8')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001b', '10000000-0000-4000-a000-00000000000b', 'PHP7'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PHP7')
);

-- Swift
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001c', '10000000-0000-4000-a000-00000000000c', 'Swift Language'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Swift Language')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001d', '10000000-0000-4000-a000-00000000000c', 'Apple Swift'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Apple Swift')
);

-- Kotlin
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001e', '10000000-0000-4000-a000-00000000000d', 'Kotlin/JVM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Kotlin/JVM')
);

-- R
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000001f', '10000000-0000-4000-a000-00000000000f', 'R Language'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('R Language')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000020', '10000000-0000-4000-a000-00000000000f', 'R Programming'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('R Programming')
);

-- Shell Scripting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000021', '10000000-0000-4000-a000-000000000016', 'Bash'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Bash')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000022', '10000000-0000-4000-a000-000000000016', 'Shell'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Shell')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000023', '10000000-0000-4000-a000-000000000016', 'Bash Scripting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Bash Scripting')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000024', '10000000-0000-4000-a000-000000000016', 'Zsh'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Zsh')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000025', '10000000-0000-4000-a000-000000000016', 'sh'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('sh')
);

-- SQL
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000026', '10000000-0000-4000-a000-000000000017', 'Structured Query Language'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Structured Query Language')
);

-- HTML
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000027', '10000000-0000-4000-a000-000000000018', 'HTML5'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HTML5')
);

-- CSS
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000028', '10000000-0000-4000-a000-000000000019', 'CSS3'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CSS3')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000029', '10000000-0000-4000-a000-000000000019', 'Cascading Style Sheets'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cascading Style Sheets')
);

-- React
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002a', '10000000-0000-4000-a000-00000000001a', 'React.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('React.js')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002b', '10000000-0000-4000-a000-00000000001a', 'ReactJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ReactJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002c', '10000000-0000-4000-a000-00000000001a', 'React JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('React JS')
);

-- Angular
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002d', '10000000-0000-4000-a000-00000000001b', 'Angular 2+'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Angular 2+')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002e', '10000000-0000-4000-a000-00000000001b', 'AngularJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AngularJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000002f', '10000000-0000-4000-a000-00000000001b', 'Angular.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Angular.js')
);

-- Vue.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000030', '10000000-0000-4000-a000-00000000001c', 'Vue'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vue')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000031', '10000000-0000-4000-a000-00000000001c', 'VueJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('VueJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000032', '10000000-0000-4000-a000-00000000001c', 'Vue JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vue JS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000033', '10000000-0000-4000-a000-00000000001c', 'Vue 3'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vue 3')
);

-- Svelte
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000034', '10000000-0000-4000-a000-00000000001d', 'SvelteKit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SvelteKit')
);

-- Next.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000035', '10000000-0000-4000-a000-00000000001e', 'NextJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('NextJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000036', '10000000-0000-4000-a000-00000000001e', 'Next JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Next JS')
);

-- Nuxt.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000037', '10000000-0000-4000-a000-00000000001f', 'NuxtJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('NuxtJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000038', '10000000-0000-4000-a000-00000000001f', 'Nuxt'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Nuxt')
);

-- Gatsby
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000039', '10000000-0000-4000-a000-000000000020', 'GatsbyJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GatsbyJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003a', '10000000-0000-4000-a000-000000000020', 'Gatsby.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Gatsby.js')
);

-- Ember.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003b', '10000000-0000-4000-a000-000000000021', 'EmberJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('EmberJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003c', '10000000-0000-4000-a000-000000000021', 'Ember'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ember')
);

-- Backbone.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003d', '10000000-0000-4000-a000-000000000022', 'BackboneJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BackboneJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003e', '10000000-0000-4000-a000-000000000022', 'Backbone'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Backbone')
);

-- Bootstrap
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000003f', '10000000-0000-4000-a000-000000000024', 'Bootstrap 5'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Bootstrap 5')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000040', '10000000-0000-4000-a000-000000000024', 'Bootstrap CSS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Bootstrap CSS')
);

-- Tailwind CSS
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000041', '10000000-0000-4000-a000-000000000025', 'TailwindCSS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TailwindCSS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000042', '10000000-0000-4000-a000-000000000025', 'Tailwind'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tailwind')
);

-- Material UI
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000043', '10000000-0000-4000-a000-000000000026', 'MUI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('MUI')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000044', '10000000-0000-4000-a000-000000000026', 'Material-UI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Material-UI')
);

-- Chakra UI
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000045', '10000000-0000-4000-a000-000000000027', 'ChakraUI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ChakraUI')
);

-- Ant Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000046', '10000000-0000-4000-a000-000000000028', 'AntD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AntD')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000047', '10000000-0000-4000-a000-000000000028', 'Ant Design System'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ant Design System')
);

-- Node.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000048', '10000000-0000-4000-a000-000000000029', 'NodeJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('NodeJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000049', '10000000-0000-4000-a000-000000000029', 'Node JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Node JS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004a', '10000000-0000-4000-a000-000000000029', 'Node'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Node')
);

-- Express.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004b', '10000000-0000-4000-a000-00000000002a', 'ExpressJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ExpressJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004c', '10000000-0000-4000-a000-00000000002a', 'Express'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Express')
);

-- Django
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004d', '10000000-0000-4000-a000-00000000002b', 'Django Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Django Framework')
);

-- Flask
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004e', '10000000-0000-4000-a000-00000000002c', 'Flask Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Flask Framework')
);

-- Spring Boot
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000004f', '10000000-0000-4000-a000-00000000002d', 'SpringBoot'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SpringBoot')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000050', '10000000-0000-4000-a000-00000000002d', 'Spring Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Spring Framework')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000051', '10000000-0000-4000-a000-00000000002d', 'Spring'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Spring')
);

-- Ruby on Rails
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000052', '10000000-0000-4000-a000-00000000002e', 'Rails'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rails')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000053', '10000000-0000-4000-a000-00000000002e', 'RoR'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RoR')
);

-- ASP.NET
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000054', '10000000-0000-4000-a000-00000000002f', 'ASP.NET Core'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ASP.NET Core')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000055', '10000000-0000-4000-a000-00000000002f', 'ASPNET'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ASPNET')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000056', '10000000-0000-4000-a000-00000000002f', '.NET'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('.NET')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000057', '10000000-0000-4000-a000-00000000002f', 'DotNet'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DotNet')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000058', '10000000-0000-4000-a000-00000000002f', 'Dotnet Core'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Dotnet Core')
);

-- Laravel
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000059', '10000000-0000-4000-a000-000000000031', 'Laravel Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Laravel Framework')
);

-- NestJS
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005a', '10000000-0000-4000-a000-000000000032', 'Nest.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Nest.js')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005b', '10000000-0000-4000-a000-000000000032', 'Nest JS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Nest JS')
);

-- Gin
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005c', '10000000-0000-4000-a000-000000000033', 'Gin Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Gin Framework')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005d', '10000000-0000-4000-a000-000000000033', 'Gin-Gonic'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Gin-Gonic')
);

-- Fiber
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005e', '10000000-0000-4000-a000-000000000034', 'GoFiber'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GoFiber')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000005f', '10000000-0000-4000-a000-000000000034', 'Go Fiber'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Go Fiber')
);

-- Phoenix
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000060', '10000000-0000-4000-a000-000000000035', 'Phoenix Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Phoenix Framework')
);

-- Actix Web
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000061', '10000000-0000-4000-a000-000000000036', 'Actix'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Actix')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000062', '10000000-0000-4000-a000-000000000036', 'Actix-Web'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Actix-Web')
);

-- Koa.js
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000063', '10000000-0000-4000-a000-000000000037', 'KoaJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KoaJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000064', '10000000-0000-4000-a000-000000000037', 'Koa'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Koa')
);

-- PostgreSQL
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000065', '10000000-0000-4000-a000-000000000038', 'Postgres'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Postgres')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000066', '10000000-0000-4000-a000-000000000038', 'PG'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PG')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000067', '10000000-0000-4000-a000-000000000038', 'psql'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('psql')
);

-- MySQL
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000068', '10000000-0000-4000-a000-000000000039', 'MariaDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('MariaDB')
);

-- MongoDB
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000069', '10000000-0000-4000-a000-00000000003a', 'Mongo'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Mongo')
);

-- Redis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006a', '10000000-0000-4000-a000-00000000003b', 'Redis Cache'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Redis Cache')
);

-- Elasticsearch
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006b', '10000000-0000-4000-a000-00000000003c', 'Elastic Search'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Elastic Search')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006c', '10000000-0000-4000-a000-00000000003c', 'ES'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ES')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006d', '10000000-0000-4000-a000-00000000003c', 'ELK'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ELK')
);

-- Oracle Database
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006e', '10000000-0000-4000-a000-00000000003e', 'Oracle DB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Oracle DB')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000006f', '10000000-0000-4000-a000-00000000003e', 'OracleDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OracleDB')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000070', '10000000-0000-4000-a000-00000000003e', 'Oracle'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Oracle')
);

-- Microsoft SQL Server
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000071', '10000000-0000-4000-a000-00000000003f', 'MSSQL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('MSSQL')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000072', '10000000-0000-4000-a000-00000000003f', 'MS SQL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('MS SQL')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000073', '10000000-0000-4000-a000-00000000003f', 'SQL Server'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SQL Server')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000074', '10000000-0000-4000-a000-00000000003f', 'T-SQL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('T-SQL')
);

-- Cassandra
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000075', '10000000-0000-4000-a000-000000000040', 'Apache Cassandra'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Apache Cassandra')
);

-- DynamoDB
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000076', '10000000-0000-4000-a000-000000000041', 'AWS DynamoDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AWS DynamoDB')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000077', '10000000-0000-4000-a000-000000000041', 'Amazon DynamoDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Amazon DynamoDB')
);

-- CouchDB
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000078', '10000000-0000-4000-a000-000000000043', 'Apache CouchDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Apache CouchDB')
);

-- Firebase Realtime Database
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000079', '10000000-0000-4000-a000-000000000044', 'Firebase DB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Firebase DB')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007a', '10000000-0000-4000-a000-000000000044', 'RTDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RTDB')
);

-- InfluxDB
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007b', '10000000-0000-4000-a000-000000000045', 'Influx'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Influx')
);

-- Firestore
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007c', '10000000-0000-4000-a000-000000000046', 'Cloud Firestore'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cloud Firestore')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007d', '10000000-0000-4000-a000-000000000046', 'Google Firestore'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google Firestore')
);

-- Amazon Web Services
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007e', '10000000-0000-4000-a000-000000000047', 'AWS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AWS')
);

-- Google Cloud Platform
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000007f', '10000000-0000-4000-a000-000000000048', 'GCP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GCP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000080', '10000000-0000-4000-a000-000000000048', 'Google Cloud'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google Cloud')
);

-- Microsoft Azure
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000081', '10000000-0000-4000-a000-000000000049', 'Azure'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Azure')
);

-- Docker
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000082', '10000000-0000-4000-a000-00000000004a', 'Docker Containers'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Docker Containers')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000083', '10000000-0000-4000-a000-00000000004a', 'Containerization'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Containerization')
);

-- Kubernetes
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000084', '10000000-0000-4000-a000-00000000004b', 'K8s'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('K8s')
);

-- Terraform
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000085', '10000000-0000-4000-a000-00000000004c', 'HashiCorp Terraform'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HashiCorp Terraform')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000086', '10000000-0000-4000-a000-00000000004c', 'TF'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TF')
);

-- Ansible
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000087', '10000000-0000-4000-a000-00000000004d', 'Ansible Automation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ansible Automation')
);

-- Jenkins
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000088', '10000000-0000-4000-a000-00000000004e', 'Jenkins CI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Jenkins CI')
);

-- GitHub Actions
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000089', '10000000-0000-4000-a000-00000000004f', 'GH Actions'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GH Actions')
);

-- GitLab CI/CD
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008a', '10000000-0000-4000-a000-000000000050', 'GitLab CI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GitLab CI')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008b', '10000000-0000-4000-a000-000000000050', 'GitLab Pipelines'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GitLab Pipelines')
);

-- CircleCI
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008c', '10000000-0000-4000-a000-000000000051', 'Circle CI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Circle CI')
);

-- Apache HTTP Server
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008d', '10000000-0000-4000-a000-000000000053', 'Apache'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Apache')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008e', '10000000-0000-4000-a000-000000000053', 'httpd'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('httpd')
);

-- DigitalOcean
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000008f', '10000000-0000-4000-a000-000000000057', 'Digital Ocean'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Digital Ocean')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000090', '10000000-0000-4000-a000-000000000057', 'DO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DO')
);

-- Cloudflare
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000091', '10000000-0000-4000-a000-000000000058', 'Cloudflare CDN'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cloudflare CDN')
);

-- Vagrant
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000092', '10000000-0000-4000-a000-00000000005a', 'HashiCorp Vagrant'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HashiCorp Vagrant')
);

-- Git
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000093', '10000000-0000-4000-a000-00000000005b', 'Git Version Control'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Git Version Control')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000094', '10000000-0000-4000-a000-00000000005b', 'Git VCS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Git VCS')
);

-- Linux
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000095', '10000000-0000-4000-a000-00000000005c', 'Linux Administration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Linux Administration')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000096', '10000000-0000-4000-a000-00000000005c', 'Linux Sysadmin'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Linux Sysadmin')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000097', '10000000-0000-4000-a000-00000000005c', 'Ubuntu'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ubuntu')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000098', '10000000-0000-4000-a000-00000000005c', 'CentOS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CentOS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000099', '10000000-0000-4000-a000-00000000005c', 'RHEL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RHEL')
);

-- CI/CD
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009a', '10000000-0000-4000-a000-00000000005d', 'Continuous Integration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Continuous Integration')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009b', '10000000-0000-4000-a000-00000000005d', 'Continuous Delivery'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Continuous Delivery')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009c', '10000000-0000-4000-a000-00000000005d', 'Continuous Deployment'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Continuous Deployment')
);

-- Prometheus
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009d', '10000000-0000-4000-a000-00000000005e', 'Prometheus Monitoring'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Prometheus Monitoring')
);

-- Grafana
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009e', '10000000-0000-4000-a000-00000000005f', 'Grafana Dashboards'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Grafana Dashboards')
);

-- New Relic
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000009f', '10000000-0000-4000-a000-000000000061', 'NewRelic'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('NewRelic')
);

-- ELK Stack
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a0', '10000000-0000-4000-a000-000000000063', 'Elastic Stack'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Elastic Stack')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a1', '10000000-0000-4000-a000-000000000063', 'Logstash'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Logstash')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a2', '10000000-0000-4000-a000-000000000063', 'Kibana'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Kibana')
);

-- Helm
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a3', '10000000-0000-4000-a000-000000000064', 'Helm Charts'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Helm Charts')
);

-- ArgoCD
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a4', '10000000-0000-4000-a000-000000000065', 'Argo CD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Argo CD')
);

-- HashiCorp Vault
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a5', '10000000-0000-4000-a000-000000000066', 'Vault'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vault')
);

-- Consul
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a6', '10000000-0000-4000-a000-000000000067', 'HashiCorp Consul'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HashiCorp Consul')
);

-- Istio
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a7', '10000000-0000-4000-a000-000000000068', 'Istio Service Mesh'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Istio Service Mesh')
);

-- Scikit-learn
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a8', '10000000-0000-4000-a000-00000000006c', 'sklearn'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('sklearn')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000a9', '10000000-0000-4000-a000-00000000006c', 'Scikit Learn'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Scikit Learn')
);

-- Apache Spark
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000aa', '10000000-0000-4000-a000-00000000006f', 'Spark'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Spark')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ab', '10000000-0000-4000-a000-00000000006f', 'PySpark'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PySpark')
);

-- Apache Kafka
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ac', '10000000-0000-4000-a000-000000000070', 'Kafka'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Kafka')
);

-- Apache Airflow
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ad', '10000000-0000-4000-a000-000000000071', 'Airflow'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Airflow')
);

-- dbt
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ae', '10000000-0000-4000-a000-000000000072', 'dbt Core'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('dbt Core')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000af', '10000000-0000-4000-a000-000000000072', 'dbt Cloud'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('dbt Cloud')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b0', '10000000-0000-4000-a000-000000000072', 'Data Build Tool'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Data Build Tool')
);

-- Snowflake
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b1', '10000000-0000-4000-a000-000000000073', 'Snowflake Data Cloud'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Snowflake Data Cloud')
);

-- BigQuery
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b2', '10000000-0000-4000-a000-000000000074', 'Google BigQuery'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google BigQuery')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b3', '10000000-0000-4000-a000-000000000074', 'GBQ'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GBQ')
);

-- Amazon Redshift
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b4', '10000000-0000-4000-a000-000000000075', 'Redshift'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Redshift')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b5', '10000000-0000-4000-a000-000000000075', 'AWS Redshift'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AWS Redshift')
);

-- Power BI
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b6', '10000000-0000-4000-a000-000000000077', 'PowerBI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PowerBI')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b7', '10000000-0000-4000-a000-000000000077', 'Microsoft Power BI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Microsoft Power BI')
);

-- Looker
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b8', '10000000-0000-4000-a000-000000000078', 'Google Looker'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google Looker')
);

-- Hadoop
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000b9', '10000000-0000-4000-a000-000000000079', 'Apache Hadoop'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Apache Hadoop')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ba', '10000000-0000-4000-a000-000000000079', 'HDFS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HDFS')
);

-- Apache Hive
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000bb', '10000000-0000-4000-a000-00000000007a', 'Hive'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Hive')
);

-- Presto
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000bc', '10000000-0000-4000-a000-00000000007b', 'PrestoDB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PrestoDB')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000bd', '10000000-0000-4000-a000-00000000007b', 'Trino'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Trino')
);

-- MLflow
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000be', '10000000-0000-4000-a000-00000000007c', 'ML Flow'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ML Flow')
);

-- Jupyter
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000bf', '10000000-0000-4000-a000-00000000007d', 'Jupyter Notebook'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Jupyter Notebook')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c0', '10000000-0000-4000-a000-00000000007d', 'Jupyter Notebooks'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Jupyter Notebooks')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c1', '10000000-0000-4000-a000-00000000007d', 'JupyterLab'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JupyterLab')
);

-- React Native
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c2', '10000000-0000-4000-a000-00000000007e', 'ReactNative'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ReactNative')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c3', '10000000-0000-4000-a000-00000000007e', 'React-Native'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('React-Native')
);

-- Flutter
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c4', '10000000-0000-4000-a000-00000000007f', 'Flutter SDK'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Flutter SDK')
);

-- iOS Development
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c5', '10000000-0000-4000-a000-000000000080', 'iOS Dev'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('iOS Dev')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c6', '10000000-0000-4000-a000-000000000080', 'iPhone Development'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('iPhone Development')
);

-- Android Development
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c7', '10000000-0000-4000-a000-000000000081', 'Android Dev'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Android Dev')
);

-- SwiftUI
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c8', '10000000-0000-4000-a000-000000000084', 'Swift UI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Swift UI')
);

-- Jetpack Compose
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000c9', '10000000-0000-4000-a000-000000000085', 'Compose'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Compose')
);

-- Expo
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ca', '10000000-0000-4000-a000-000000000086', 'Expo SDK'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Expo SDK')
);

-- Ionic
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000cb', '10000000-0000-4000-a000-000000000087', 'Ionic Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ionic Framework')
);

-- Jest
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000cc', '10000000-0000-4000-a000-000000000088', 'Jest Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Jest Testing')
);

-- Cypress
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000cd', '10000000-0000-4000-a000-000000000089', 'Cypress.io'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cypress.io')
);

-- Selenium
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ce', '10000000-0000-4000-a000-00000000008a', 'Selenium WebDriver'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Selenium WebDriver')
);

-- Playwright
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000cf', '10000000-0000-4000-a000-00000000008b', 'Playwright Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Playwright Testing')
);

-- JUnit
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d0', '10000000-0000-4000-a000-00000000008c', 'JUnit 5'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JUnit 5')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d1', '10000000-0000-4000-a000-00000000008c', 'JUnit4'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JUnit4')
);

-- pytest
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d2', '10000000-0000-4000-a000-00000000008d', 'py.test'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('py.test')
);

-- Mocha
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d3', '10000000-0000-4000-a000-00000000008e', 'Mocha.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Mocha.js')
);

-- Chai
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d4', '10000000-0000-4000-a000-00000000008f', 'Chai.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Chai.js')
);

-- Robot Framework
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d5', '10000000-0000-4000-a000-000000000091', 'RobotFramework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RobotFramework')
);

-- OWASP
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d6', '10000000-0000-4000-a000-000000000092', 'OWASP Top 10'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OWASP Top 10')
);

-- Penetration Testing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d7', '10000000-0000-4000-a000-000000000093', 'Pen Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Pen Testing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d8', '10000000-0000-4000-a000-000000000093', 'Pentesting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Pentesting')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000d9', '10000000-0000-4000-a000-000000000093', 'Pentest'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Pentest')
);

-- Cryptography
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000da', '10000000-0000-4000-a000-000000000094', 'Encryption'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Encryption')
);

-- OAuth
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000db', '10000000-0000-4000-a000-000000000095', 'OAuth 2.0'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OAuth 2.0')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000dc', '10000000-0000-4000-a000-000000000095', 'OAuth2'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OAuth2')
);

-- JWT
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000dd', '10000000-0000-4000-a000-000000000096', 'JSON Web Tokens'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JSON Web Tokens')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000de', '10000000-0000-4000-a000-000000000096', 'JSON Web Token'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JSON Web Token')
);

-- SSL/TLS
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000df', '10000000-0000-4000-a000-000000000097', 'SSL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SSL')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e0', '10000000-0000-4000-a000-000000000097', 'TLS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TLS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e1', '10000000-0000-4000-a000-000000000097', 'HTTPS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HTTPS')
);

-- Firewall Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e2', '10000000-0000-4000-a000-000000000098', 'Firewalls'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Firewalls')
);

-- VPN
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e3', '10000000-0000-4000-a000-000000000099', 'Virtual Private Network'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Virtual Private Network')
);

-- SIEM
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e4', '10000000-0000-4000-a000-00000000009a', 'Security Information and Event Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Security Information and Event Management')
);

-- SOC Operations
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e5', '10000000-0000-4000-a000-00000000009b', 'SOC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SOC')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e6', '10000000-0000-4000-a000-00000000009b', 'Security Operations Center'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Security Operations Center')
);

-- REST API Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e7', '10000000-0000-4000-a000-00000000009c', 'REST'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('REST')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e8', '10000000-0000-4000-a000-00000000009c', 'RESTful'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RESTful')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000e9', '10000000-0000-4000-a000-00000000009c', 'REST APIs'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('REST APIs')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ea', '10000000-0000-4000-a000-00000000009c', 'RESTful APIs'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RESTful APIs')
);

-- GraphQL
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000eb', '10000000-0000-4000-a000-00000000009d', 'Graph QL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Graph QL')
);

-- Microservices Architecture
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ec', '10000000-0000-4000-a000-00000000009e', 'Microservices'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Microservices')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ed', '10000000-0000-4000-a000-00000000009e', 'Micro Services'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Micro Services')
);

-- Event-Driven Architecture
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ee', '10000000-0000-4000-a000-00000000009f', 'EDA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('EDA')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ef', '10000000-0000-4000-a000-00000000009f', 'Event Driven Architecture'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Event Driven Architecture')
);

-- Domain-Driven Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f0', '10000000-0000-4000-a000-0000000000a0', 'DDD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DDD')
);

-- Agile
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f1', '10000000-0000-4000-a000-0000000000a1', 'Agile Methodology'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Agile Methodology')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f2', '10000000-0000-4000-a000-0000000000a1', 'Scrum'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Scrum')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f3', '10000000-0000-4000-a000-0000000000a1', 'Agile/Scrum'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Agile/Scrum')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f4', '10000000-0000-4000-a000-0000000000a1', 'Kanban'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Kanban')
);

-- System Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f5', '10000000-0000-4000-a000-0000000000a2', 'Systems Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Systems Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f6', '10000000-0000-4000-a000-0000000000a2', 'Distributed Systems'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Distributed Systems')
);

-- Data Structures and Algorithms
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f7', '10000000-0000-4000-a000-0000000000a3', 'DSA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DSA')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f8', '10000000-0000-4000-a000-0000000000a3', 'Data Structures & Algorithms'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Data Structures & Algorithms')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000f9', '10000000-0000-4000-a000-0000000000a3', 'Algorithms'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Algorithms')
);

-- Object-Oriented Programming
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000fa', '10000000-0000-4000-a000-0000000000a4', 'OOP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OOP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000fb', '10000000-0000-4000-a000-0000000000a4', 'Object Oriented Programming'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Object Oriented Programming')
);

-- Functional Programming
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000fc', '10000000-0000-4000-a000-0000000000a5', 'FP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('FP')
);

-- Design Patterns
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000fd', '10000000-0000-4000-a000-0000000000a6', 'Software Design Patterns'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Software Design Patterns')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000fe', '10000000-0000-4000-a000-0000000000a6', 'GoF Patterns'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GoF Patterns')
);

-- Clean Architecture
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-0000000000ff', '10000000-0000-4000-a000-0000000000a7', 'Hexagonal Architecture'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Hexagonal Architecture')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000100', '10000000-0000-4000-a000-0000000000a7', 'Onion Architecture'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Onion Architecture')
);

-- Test-Driven Development
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000101', '10000000-0000-4000-a000-0000000000a8', 'TDD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TDD')
);

-- WebSockets
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000102', '10000000-0000-4000-a000-0000000000a9', 'Web Sockets'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Web Sockets')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000103', '10000000-0000-4000-a000-0000000000a9', 'Socket.io'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Socket.io')
);

-- gRPC
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000104', '10000000-0000-4000-a000-0000000000aa', 'Google RPC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google RPC')
);

-- Vite
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000105', '10000000-0000-4000-a000-0000000000ac', 'ViteJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ViteJS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000106', '10000000-0000-4000-a000-0000000000ac', 'Vite.js'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Vite.js')
);

-- Babel
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000107', '10000000-0000-4000-a000-0000000000ad', 'BabelJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BabelJS')
);

-- Storybook
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000108', '10000000-0000-4000-a000-0000000000b0', 'StorybookJS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('StorybookJS')
);

-- Postman
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-000000000109', '10000000-0000-4000-a000-0000000000b1', 'Postman API'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Postman API')
);

-- Swagger
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010a', '10000000-0000-4000-a000-0000000000b2', 'OpenAPI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OpenAPI')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010b', '10000000-0000-4000-a000-0000000000b2', 'Swagger/OpenAPI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Swagger/OpenAPI')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010c', '10000000-0000-4000-a000-0000000000b2', 'OpenAPI Specification'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('OpenAPI Specification')
);

-- RabbitMQ
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010d', '10000000-0000-4000-a000-0000000000b3', 'Rabbit MQ'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rabbit MQ')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010e', '10000000-0000-4000-a000-0000000000b3', 'RabbitMQ Messaging'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RabbitMQ Messaging')
);

-- Apache Maven
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '11000000-0000-4000-a000-00000000010f', '10000000-0000-4000-a000-0000000000b4', 'Maven'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Maven')
);

-- ════════════════════════════════════════════════════════════════════
-- MARKETING ALIASES (118 aliases for 72 skills)
-- ════════════════════════════════════════════════════════════════════

-- SEO
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'Search Engine Optimization'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Search Engine Optimization')
);

-- Technical SEO
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000002', 'Tech SEO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tech SEO')
);

-- Keyword Research
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000003', '20000000-0000-4000-a000-000000000003', 'KW Research'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KW Research')
);

-- Link Building
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000004', '20000000-0000-4000-a000-000000000004', 'Backlink Strategy'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Backlink Strategy')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000005', '20000000-0000-4000-a000-000000000004', 'Backlinks'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Backlinks')
);

-- On-Page SEO
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000006', '20000000-0000-4000-a000-000000000005', 'On Page SEO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('On Page SEO')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000007', '20000000-0000-4000-a000-000000000005', 'On-Site SEO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('On-Site SEO')
);

-- Off-Page SEO
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000008', '20000000-0000-4000-a000-000000000006', 'Off Page SEO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Off Page SEO')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000009', '20000000-0000-4000-a000-000000000006', 'Off-Site SEO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Off-Site SEO')
);

-- Local SEO
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000a', '20000000-0000-4000-a000-000000000007', 'Google My Business'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google My Business')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000b', '20000000-0000-4000-a000-000000000007', 'GMB'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GMB')
);

-- SEO Auditing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000c', '20000000-0000-4000-a000-000000000008', 'SEO Audit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SEO Audit')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000d', '20000000-0000-4000-a000-000000000008', 'Site Audit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Site Audit')
);

-- Schema Markup
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000e', '20000000-0000-4000-a000-000000000009', 'Structured Data'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Structured Data')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000000f', '20000000-0000-4000-a000-000000000009', 'JSON-LD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('JSON-LD')
);

-- Core Web Vitals
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000010', '20000000-0000-4000-a000-00000000000a', 'CWV'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CWV')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000011', '20000000-0000-4000-a000-00000000000a', 'Page Speed Optimization'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Page Speed Optimization')
);

-- Content Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000012', '20000000-0000-4000-a000-00000000000b', 'Content Mktg'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Content Mktg')
);

-- Copywriting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000013', '20000000-0000-4000-a000-00000000000c', 'Copy Writing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Copy Writing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000014', '20000000-0000-4000-a000-00000000000c', 'Ad Copy'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ad Copy')
);

-- Content Strategy
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000015', '20000000-0000-4000-a000-00000000000d', 'Content Planning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Content Planning')
);

-- Blog Writing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000016', '20000000-0000-4000-a000-00000000000e', 'Blogging'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Blogging')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000017', '20000000-0000-4000-a000-00000000000e', 'Blog Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Blog Management')
);

-- Technical Writing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000018', '20000000-0000-4000-a000-00000000000f', 'Tech Writing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tech Writing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000019', '20000000-0000-4000-a000-00000000000f', 'Documentation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Documentation')
);

-- Ghostwriting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001a', '20000000-0000-4000-a000-000000000010', 'Ghost Writing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ghost Writing')
);

-- Editorial Planning
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001b', '20000000-0000-4000-a000-000000000011', 'Editorial Calendar'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Editorial Calendar')
);

-- Content Distribution
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001c', '20000000-0000-4000-a000-000000000012', 'Content Syndication'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Content Syndication')
);

-- Brand Storytelling
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001d', '20000000-0000-4000-a000-000000000013', 'Brand Narrative'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Narrative')
);

-- UX Writing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001e', '20000000-0000-4000-a000-000000000014', 'UX Copywriting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UX Copywriting')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000001f', '20000000-0000-4000-a000-000000000014', 'Microcopy'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Microcopy')
);

-- Social Media Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000020', '20000000-0000-4000-a000-000000000015', 'SMM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SMM')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000021', '20000000-0000-4000-a000-000000000015', 'Social Media Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Social Media Management')
);

-- Instagram Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000022', '20000000-0000-4000-a000-000000000016', 'Instagram Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Instagram Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000023', '20000000-0000-4000-a000-000000000016', 'IG Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('IG Marketing')
);

-- Facebook Advertising
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000024', '20000000-0000-4000-a000-000000000017', 'Facebook Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Facebook Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000025', '20000000-0000-4000-a000-000000000017', 'FB Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('FB Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000026', '20000000-0000-4000-a000-000000000017', 'Meta Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Meta Ads')
);

-- LinkedIn Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000027', '20000000-0000-4000-a000-000000000018', 'LinkedIn Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('LinkedIn Ads')
);

-- TikTok Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000028', '20000000-0000-4000-a000-000000000019', 'TikTok Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TikTok Ads')
);

-- Twitter Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000029', '20000000-0000-4000-a000-00000000001a', 'X Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('X Marketing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002a', '20000000-0000-4000-a000-00000000001a', 'Twitter/X'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Twitter/X')
);

-- Pinterest Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002b', '20000000-0000-4000-a000-00000000001b', 'Pinterest Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Pinterest Ads')
);

-- YouTube Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002c', '20000000-0000-4000-a000-00000000001c', 'YouTube Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('YouTube Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002d', '20000000-0000-4000-a000-00000000001c', 'Video Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Video Marketing')
);

-- Influencer Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002e', '20000000-0000-4000-a000-00000000001d', 'Influencer Outreach'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Influencer Outreach')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000002f', '20000000-0000-4000-a000-00000000001d', 'Creator Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Creator Marketing')
);

-- Community Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000030', '20000000-0000-4000-a000-00000000001e', 'Community Building'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Community Building')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000031', '20000000-0000-4000-a000-00000000001e', 'Online Community'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Online Community')
);

-- Google Ads
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000032', '20000000-0000-4000-a000-00000000001f', 'Google AdWords'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google AdWords')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000033', '20000000-0000-4000-a000-00000000001f', 'AdWords'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AdWords')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000034', '20000000-0000-4000-a000-00000000001f', 'Google PPC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google PPC')
);

-- Pay-Per-Click Advertising
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000035', '20000000-0000-4000-a000-000000000020', 'PPC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PPC')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000036', '20000000-0000-4000-a000-000000000020', 'Paid Search'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Paid Search')
);

-- Display Advertising
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000037', '20000000-0000-4000-a000-000000000021', 'Display Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Display Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000038', '20000000-0000-4000-a000-000000000021', 'Banner Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Banner Ads')
);

-- Programmatic Advertising
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000039', '20000000-0000-4000-a000-000000000022', 'Programmatic Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Programmatic Ads')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003a', '20000000-0000-4000-a000-000000000022', 'Programmatic Media Buying'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Programmatic Media Buying')
);

-- Retargeting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003b', '20000000-0000-4000-a000-000000000023', 'Remarketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Remarketing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003c', '20000000-0000-4000-a000-000000000023', 'Retargeting Ads'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Retargeting Ads')
);

-- Facebook Ads Manager
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003d', '20000000-0000-4000-a000-000000000024', 'Meta Ads Manager'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Meta Ads Manager')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003e', '20000000-0000-4000-a000-000000000024', 'FB Ads Manager'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('FB Ads Manager')
);

-- Conversion Rate Optimization
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000003f', '20000000-0000-4000-a000-000000000025', 'CRO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CRO')
);

-- A/B Testing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000040', '20000000-0000-4000-a000-000000000026', 'Split Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Split Testing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000041', '20000000-0000-4000-a000-000000000026', 'AB Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AB Testing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000042', '20000000-0000-4000-a000-000000000026', 'Multivariate Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Multivariate Testing')
);

-- Attribution Modeling
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000043', '20000000-0000-4000-a000-000000000027', 'Marketing Attribution'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Marketing Attribution')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000044', '20000000-0000-4000-a000-000000000027', 'Multi-Touch Attribution'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Multi-Touch Attribution')
);

-- Performance Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000045', '20000000-0000-4000-a000-000000000028', 'Growth Performance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Growth Performance')
);

-- Email Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000046', '20000000-0000-4000-a000-000000000029', 'Email Campaigns'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Email Campaigns')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000047', '20000000-0000-4000-a000-000000000029', 'Email Mktg'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Email Mktg')
);

-- HubSpot Email
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000048', '20000000-0000-4000-a000-00000000002b', 'HubSpot Email Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HubSpot Email Marketing')
);

-- Marketing Automation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000049', '20000000-0000-4000-a000-00000000002c', 'Marketing Ops'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Marketing Ops')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004a', '20000000-0000-4000-a000-00000000002c', 'MktOps'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('MktOps')
);

-- Drip Campaigns
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004b', '20000000-0000-4000-a000-00000000002d', 'Drip Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Drip Marketing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004c', '20000000-0000-4000-a000-00000000002d', 'Automated Email Sequences'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Automated Email Sequences')
);

-- Newsletter Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004d', '20000000-0000-4000-a000-00000000002e', 'Email Newsletters'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Email Newsletters')
);

-- Email Deliverability
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004e', '20000000-0000-4000-a000-00000000002f', 'Inbox Placement'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Inbox Placement')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000004f', '20000000-0000-4000-a000-00000000002f', 'Email Reputation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Email Reputation')
);

-- Google Analytics
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000050', '20000000-0000-4000-a000-000000000031', 'GA4'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GA4')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000051', '20000000-0000-4000-a000-000000000031', 'GA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GA')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000052', '20000000-0000-4000-a000-000000000031', 'Google Analytics 4'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Google Analytics 4')
);

-- Marketing Data Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000053', '20000000-0000-4000-a000-000000000032', 'Marketing Analytics'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Marketing Analytics')
);

-- Google Tag Manager
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000054', '20000000-0000-4000-a000-000000000033', 'GTM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GTM')
);

-- Amplitude
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000055', '20000000-0000-4000-a000-000000000035', 'Amplitude Analytics'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Amplitude Analytics')
);

-- Heap Analytics
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000056', '20000000-0000-4000-a000-000000000037', 'Heap'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Heap')
);

-- Segment
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000057', '20000000-0000-4000-a000-000000000038', 'Twilio Segment'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Twilio Segment')
);

-- Brand Strategy
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000058', '20000000-0000-4000-a000-000000000039', 'Branding'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Branding')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000059', '20000000-0000-4000-a000-000000000039', 'Brand Development'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Development')
);

-- Market Research
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005a', '20000000-0000-4000-a000-00000000003a', 'Consumer Research'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Consumer Research')
);

-- Competitive Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005b', '20000000-0000-4000-a000-00000000003b', 'Competitor Research'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Competitor Research')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005c', '20000000-0000-4000-a000-00000000003b', 'Competitive Intelligence'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Competitive Intelligence')
);

-- Go-to-Market Strategy
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005d', '20000000-0000-4000-a000-00000000003c', 'GTM Strategy'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GTM Strategy')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005e', '20000000-0000-4000-a000-00000000003c', 'Go to Market'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Go to Market')
);

-- Product Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000005f', '20000000-0000-4000-a000-00000000003d', 'PMM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PMM')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000060', '20000000-0000-4000-a000-00000000003d', 'Product Mktg'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Product Mktg')
);

-- Growth Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000061', '20000000-0000-4000-a000-00000000003e', 'Growth Hacking'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Growth Hacking')
);

-- Brand Identity
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000062', '20000000-0000-4000-a000-00000000003f', 'Brand Guidelines'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Guidelines')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000063', '20000000-0000-4000-a000-00000000003f', 'Visual Identity'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Visual Identity')
);

-- Positioning
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000064', '20000000-0000-4000-a000-000000000040', 'Brand Positioning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Positioning')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000065', '20000000-0000-4000-a000-000000000040', 'Market Positioning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Market Positioning')
);

-- Public Relations
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000066', '20000000-0000-4000-a000-000000000041', 'PR'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PR')
);

-- Press Releases
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000067', '20000000-0000-4000-a000-000000000042', 'Press Release Writing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Press Release Writing')
);

-- Media Relations
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000068', '20000000-0000-4000-a000-000000000043', 'Media Outreach'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Media Outreach')
);

-- Crisis Communications
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000069', '20000000-0000-4000-a000-000000000044', 'Crisis Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Crisis Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006a', '20000000-0000-4000-a000-000000000044', 'Crisis PR'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Crisis PR')
);

-- Event Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006b', '20000000-0000-4000-a000-000000000046', 'Event Planning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Event Planning')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006c', '20000000-0000-4000-a000-000000000046', 'Event Promotion'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Event Promotion')
);

-- Sponsorship Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006d', '20000000-0000-4000-a000-000000000047', 'Sponsorships'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sponsorships')
);

-- Podcast Marketing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006e', '20000000-0000-4000-a000-000000000048', 'Podcast Production'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Podcast Production')
);

-- HubSpot
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-00000000006f', '20000000-0000-4000-a000-000000000049', 'HubSpot CRM Marketing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HubSpot CRM Marketing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000070', '20000000-0000-4000-a000-000000000049', 'HubSpot Marketing Hub'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HubSpot Marketing Hub')
);

-- Salesforce Marketing Cloud
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000071', '20000000-0000-4000-a000-00000000004a', 'SFMC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SFMC')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000072', '20000000-0000-4000-a000-00000000004a', 'Marketing Cloud'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Marketing Cloud')
);

-- Marketo
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000073', '20000000-0000-4000-a000-00000000004b', 'Adobe Marketo'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Adobe Marketo')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000074', '20000000-0000-4000-a000-00000000004b', 'Marketo Engage'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Marketo Engage')
);

-- Buffer
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000075', '20000000-0000-4000-a000-00000000004d', 'Buffer App'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Buffer App')
);

-- Canva
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '21000000-0000-4000-a000-000000000076', '20000000-0000-4000-a000-00000000004e', 'Canva Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Canva Design')
);

-- ════════════════════════════════════════════════════════════════════
-- ACCOUNTING ALIASES (82 aliases for 45 skills)
-- ════════════════════════════════════════════════════════════════════

-- Financial Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000001', '30000000-0000-4000-a000-000000000001', 'Financial Analyst Skills'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Financial Analyst Skills')
);

-- Financial Reporting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000002', '30000000-0000-4000-a000-000000000002', 'Financial Statements'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Financial Statements')
);

-- Financial Modeling
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000003', 'Financial Models'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Financial Models')
);

-- Budgeting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000004', '30000000-0000-4000-a000-000000000004', 'Budget Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Budget Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000005', '30000000-0000-4000-a000-000000000004', 'Budget Planning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Budget Planning')
);

-- Forecasting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000006', '30000000-0000-4000-a000-000000000005', 'Financial Forecasting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Financial Forecasting')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000007', '30000000-0000-4000-a000-000000000005', 'Revenue Forecasting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Revenue Forecasting')
);

-- Cash Flow Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000008', '30000000-0000-4000-a000-000000000006', 'Cash Flow Analysis'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cash Flow Analysis')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000009', '30000000-0000-4000-a000-000000000006', 'Cash Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cash Management')
);

-- Variance Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000a', '30000000-0000-4000-a000-000000000007', 'Budget Variance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Budget Variance')
);

-- Cost Accounting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000b', '30000000-0000-4000-a000-000000000008', 'Cost Analysis'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cost Analysis')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000c', '30000000-0000-4000-a000-000000000008', 'Costing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Costing')
);

-- Revenue Recognition
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000d', '30000000-0000-4000-a000-000000000009', 'ASC 606'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ASC 606')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000e', '30000000-0000-4000-a000-000000000009', 'Rev Rec'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rev Rec')
);

-- Financial Planning and Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000000f', '30000000-0000-4000-a000-00000000000a', 'FP&A'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('FP&A')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000010', '30000000-0000-4000-a000-00000000000a', 'FPA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('FPA')
);

-- Tax Preparation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000011', '30000000-0000-4000-a000-00000000000b', 'Tax Prep'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tax Prep')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000012', '30000000-0000-4000-a000-00000000000b', 'Tax Filing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tax Filing')
);

-- Tax Planning
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000013', '30000000-0000-4000-a000-00000000000c', 'Tax Strategy'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tax Strategy')
);

-- Corporate Tax
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000014', '30000000-0000-4000-a000-00000000000d', 'Corporate Taxation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Corporate Taxation')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000015', '30000000-0000-4000-a000-00000000000d', 'Business Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business Tax')
);

-- Individual Tax
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000016', '30000000-0000-4000-a000-00000000000e', 'Personal Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Personal Tax')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000017', '30000000-0000-4000-a000-00000000000e', 'Individual Taxation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Individual Taxation')
);

-- Sales Tax
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000018', '30000000-0000-4000-a000-00000000000f', 'Sales & Use Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sales & Use Tax')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000019', '30000000-0000-4000-a000-00000000000f', 'Indirect Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Indirect Tax')
);

-- Tax Compliance
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001a', '30000000-0000-4000-a000-000000000010', 'Tax Regulatory Compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Tax Regulatory Compliance')
);

-- International Tax
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001b', '30000000-0000-4000-a000-000000000011', 'Global Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Global Tax')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001c', '30000000-0000-4000-a000-000000000011', 'Cross-Border Tax'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cross-Border Tax')
);

-- Transfer Pricing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001d', '30000000-0000-4000-a000-000000000012', 'TP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('TP')
);

-- Internal Auditing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001e', '30000000-0000-4000-a000-000000000013', 'Internal Audit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Internal Audit')
);

-- External Auditing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000001f', '30000000-0000-4000-a000-000000000014', 'External Audit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('External Audit')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000020', '30000000-0000-4000-a000-000000000014', 'Statutory Audit'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Statutory Audit')
);

-- SOX Compliance
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000021', '30000000-0000-4000-a000-000000000015', 'Sarbanes-Oxley'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sarbanes-Oxley')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000022', '30000000-0000-4000-a000-000000000015', 'SOX'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SOX')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000023', '30000000-0000-4000-a000-000000000015', 'SOX 404'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SOX 404')
);

-- Risk Assessment
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000024', '30000000-0000-4000-a000-000000000016', 'Audit Risk Assessment'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Audit Risk Assessment')
);

-- Fraud Detection
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000025', '30000000-0000-4000-a000-000000000017', 'Fraud Prevention'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Fraud Prevention')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000026', '30000000-0000-4000-a000-000000000017', 'Forensic Accounting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Forensic Accounting')
);

-- Audit Planning
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000027', '30000000-0000-4000-a000-000000000018', 'Audit Programs'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Audit Programs')
);

-- Internal Controls
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000028', '30000000-0000-4000-a000-000000000019', 'Internal Control Framework'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Internal Control Framework')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000029', '30000000-0000-4000-a000-000000000019', 'COSO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('COSO')
);

-- QuickBooks
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002a', '30000000-0000-4000-a000-00000000001a', 'QuickBooks Online'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('QuickBooks Online')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002b', '30000000-0000-4000-a000-00000000001a', 'QBO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('QBO')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002c', '30000000-0000-4000-a000-00000000001a', 'QuickBooks Desktop'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('QuickBooks Desktop')
);

-- SAP
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002d', '30000000-0000-4000-a000-00000000001b', 'SAP ERP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SAP ERP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002e', '30000000-0000-4000-a000-00000000001b', 'SAP FICO'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SAP FICO')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000002f', '30000000-0000-4000-a000-00000000001b', 'SAP S/4HANA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SAP S/4HANA')
);

-- Oracle Financials
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000030', '30000000-0000-4000-a000-00000000001c', 'Oracle ERP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Oracle ERP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000031', '30000000-0000-4000-a000-00000000001c', 'Oracle Cloud Financials'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Oracle Cloud Financials')
);

-- Xero
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000032', '30000000-0000-4000-a000-00000000001d', 'Xero Accounting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Xero Accounting')
);

-- NetSuite
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000033', '30000000-0000-4000-a000-00000000001e', 'Oracle NetSuite'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Oracle NetSuite')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000034', '30000000-0000-4000-a000-00000000001e', 'NetSuite ERP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('NetSuite ERP')
);

-- Sage
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000035', '30000000-0000-4000-a000-00000000001f', 'Sage Intacct'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sage Intacct')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000036', '30000000-0000-4000-a000-00000000001f', 'Sage 50'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sage 50')
);

-- Microsoft Dynamics 365
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000037', '30000000-0000-4000-a000-000000000020', 'Dynamics 365'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Dynamics 365')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000038', '30000000-0000-4000-a000-000000000020', 'D365'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('D365')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000039', '30000000-0000-4000-a000-000000000020', 'Dynamics GP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Dynamics GP')
);

-- BlackLine
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003a', '30000000-0000-4000-a000-000000000021', 'BlackLine Accounting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BlackLine Accounting')
);

-- GAAP
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003b', '30000000-0000-4000-a000-000000000022', 'US GAAP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('US GAAP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003c', '30000000-0000-4000-a000-000000000022', 'Generally Accepted Accounting Principles'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Generally Accepted Accounting Principles')
);

-- IFRS
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003d', '30000000-0000-4000-a000-000000000023', 'International Financial Reporting Standards'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('International Financial Reporting Standards')
);

-- Regulatory Compliance
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003e', '30000000-0000-4000-a000-000000000024', 'Financial Compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Financial Compliance')
);

-- Anti-Money Laundering
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000003f', '30000000-0000-4000-a000-000000000025', 'AML'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AML')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000040', '30000000-0000-4000-a000-000000000025', 'AML Compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AML Compliance')
);

-- Know Your Customer
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000041', '30000000-0000-4000-a000-000000000026', 'KYC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KYC')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000042', '30000000-0000-4000-a000-000000000026', 'KYC Compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KYC Compliance')
);

-- SEC Reporting
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000043', '30000000-0000-4000-a000-000000000027', 'SEC Filings'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SEC Filings')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000044', '30000000-0000-4000-a000-000000000027', '10-K'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('10-K')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000045', '30000000-0000-4000-a000-000000000027', '10-Q'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('10-Q')
);

-- Accounts Payable
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000046', '30000000-0000-4000-a000-000000000028', 'AP'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AP')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000047', '30000000-0000-4000-a000-000000000028', 'A/P'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('A/P')
);

-- Accounts Receivable
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000048', '30000000-0000-4000-a000-000000000029', 'AR'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AR')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000049', '30000000-0000-4000-a000-000000000029', 'A/R'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('A/R')
);

-- Payroll
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004a', '30000000-0000-4000-a000-00000000002a', 'Payroll Processing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Payroll Processing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004b', '30000000-0000-4000-a000-00000000002a', 'Payroll Administration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Payroll Administration')
);

-- General Ledger
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004c', '30000000-0000-4000-a000-00000000002b', 'GL'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('GL')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004d', '30000000-0000-4000-a000-00000000002b', 'G/L'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('G/L')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004e', '30000000-0000-4000-a000-00000000002b', 'General Ledger Accounting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('General Ledger Accounting')
);

-- Bank Reconciliation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-00000000004f', '30000000-0000-4000-a000-00000000002c', 'Account Reconciliation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Account Reconciliation')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000050', '30000000-0000-4000-a000-00000000002c', 'Reconciliations'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Reconciliations')
);

-- Fixed Assets
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000051', '30000000-0000-4000-a000-00000000002d', 'Fixed Asset Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Fixed Asset Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '31000000-0000-4000-a000-000000000052', '30000000-0000-4000-a000-00000000002d', 'Asset Accounting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Asset Accounting')
);

-- ════════════════════════════════════════════════════════════════════
-- DESIGN ALIASES (73 aliases for 44 skills)
-- ════════════════════════════════════════════════════════════════════

-- UX Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000001', '40000000-0000-4000-a000-000000000001', 'User Experience Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('User Experience Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000002', '40000000-0000-4000-a000-000000000001', 'User Experience'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('User Experience')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000001', 'UXD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UXD')
);

-- User Research
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000004', '40000000-0000-4000-a000-000000000002', 'UX Research'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UX Research')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000005', '40000000-0000-4000-a000-000000000002', 'UXR'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UXR')
);

-- Wireframing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000006', '40000000-0000-4000-a000-000000000003', 'Wireframes'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Wireframes')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000007', '40000000-0000-4000-a000-000000000003', 'Lo-Fi Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Lo-Fi Design')
);

-- Prototyping
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000008', '40000000-0000-4000-a000-000000000004', 'Rapid Prototyping'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rapid Prototyping')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000009', '40000000-0000-4000-a000-000000000004', 'Hi-Fi Prototyping'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Hi-Fi Prototyping')
);

-- Usability Testing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000a', '40000000-0000-4000-a000-000000000005', 'User Testing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('User Testing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000b', '40000000-0000-4000-a000-000000000005', 'UT'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UT')
);

-- Information Architecture
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000c', '40000000-0000-4000-a000-000000000006', 'IA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('IA')
);

-- Interaction Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000d', '40000000-0000-4000-a000-000000000007', 'IxD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('IxD')
);

-- Design-Oriented Writing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000e', '40000000-0000-4000-a000-000000000008', 'Design Writing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Design Writing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000000f', '40000000-0000-4000-a000-000000000008', 'Design Copywriting'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Design Copywriting')
);

-- Accessibility Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000010', '40000000-0000-4000-a000-000000000009', 'A11y'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('A11y')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000011', '40000000-0000-4000-a000-000000000009', 'WCAG'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('WCAG')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000012', '40000000-0000-4000-a000-000000000009', 'ADA Compliance'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ADA Compliance')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000013', '40000000-0000-4000-a000-000000000009', 'Inclusive Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Inclusive Design')
);

-- Design Systems
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000014', '40000000-0000-4000-a000-00000000000a', 'Component Libraries'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Component Libraries')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000015', '40000000-0000-4000-a000-00000000000a', 'Style Guides'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Style Guides')
);

-- UI Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000016', '40000000-0000-4000-a000-00000000000b', 'User Interface Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('User Interface Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000017', '40000000-0000-4000-a000-00000000000b', 'UID'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('UID')
);

-- Visual Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000018', '40000000-0000-4000-a000-00000000000c', 'Visual Communication'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Visual Communication')
);

-- Responsive Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000019', '40000000-0000-4000-a000-00000000000d', 'Responsive Web Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Responsive Web Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001a', '40000000-0000-4000-a000-00000000000d', 'RWD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RWD')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001b', '40000000-0000-4000-a000-00000000000d', 'Mobile-First Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Mobile-First Design')
);

-- Mobile UI Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001c', '40000000-0000-4000-a000-00000000000e', 'Mobile App Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Mobile App Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001d', '40000000-0000-4000-a000-00000000000e', 'App UI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('App UI')
);

-- Web Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001e', '40000000-0000-4000-a000-00000000000f', 'Website Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Website Design')
);

-- Icon Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000001f', '40000000-0000-4000-a000-000000000010', 'Iconography'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Iconography')
);

-- Color Theory
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000020', '40000000-0000-4000-a000-000000000011', 'Color Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Color Design')
);

-- Layout Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000021', '40000000-0000-4000-a000-000000000012', 'Grid Systems'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Grid Systems')
);

-- Graphic Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000022', '40000000-0000-4000-a000-000000000013', 'Graphics Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Graphics Design')
);

-- Logo Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000023', '40000000-0000-4000-a000-000000000014', 'Logomark Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Logomark Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000024', '40000000-0000-4000-a000-000000000014', 'Brand Mark Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Mark Design')
);

-- Brand Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000025', '40000000-0000-4000-a000-000000000015', 'Brand Identity Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Brand Identity Design')
);

-- Print Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000026', '40000000-0000-4000-a000-000000000016', 'Print Layout'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Print Layout')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000027', '40000000-0000-4000-a000-000000000016', 'Publication Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Publication Design')
);

-- Packaging Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000028', '40000000-0000-4000-a000-000000000017', 'Package Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Package Design')
);

-- Typography
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000029', '40000000-0000-4000-a000-000000000018', 'Type Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Type Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002a', '40000000-0000-4000-a000-000000000018', 'Typographic Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Typographic Design')
);

-- Illustration
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002b', '40000000-0000-4000-a000-000000000019', 'Digital Illustration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Digital Illustration')
);

-- Infographics
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002c', '40000000-0000-4000-a000-00000000001a', 'Infographic Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Infographic Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002d', '40000000-0000-4000-a000-00000000001a', 'Data Visualization Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Data Visualization Design')
);

-- Figma
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002e', '40000000-0000-4000-a000-00000000001b', 'Figma Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Figma Design')
);

-- Sketch
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000002f', '40000000-0000-4000-a000-00000000001c', 'Sketch App'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sketch App')
);

-- Adobe Photoshop
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000030', '40000000-0000-4000-a000-00000000001d', 'Photoshop'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Photoshop')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000031', '40000000-0000-4000-a000-00000000001d', 'PS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PS')
);

-- Adobe Illustrator
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000032', '40000000-0000-4000-a000-00000000001e', 'Illustrator'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Illustrator')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000033', '40000000-0000-4000-a000-00000000001e', 'AI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AI')
);

-- Adobe XD
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000034', '40000000-0000-4000-a000-00000000001f', 'XD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('XD')
);

-- Framer
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000035', '40000000-0000-4000-a000-000000000021', 'Framer Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Framer Design')
);

-- Adobe InDesign
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000036', '40000000-0000-4000-a000-000000000022', 'InDesign'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('InDesign')
);

-- Adobe After Effects
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000037', '40000000-0000-4000-a000-000000000023', 'After Effects'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('After Effects')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000038', '40000000-0000-4000-a000-000000000023', 'AE'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('AE')
);

-- Blender
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000039', '40000000-0000-4000-a000-000000000024', 'Blender 3D'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Blender 3D')
);

-- Motion Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003a', '40000000-0000-4000-a000-000000000025', 'Motion Graphics'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Motion Graphics')
);

-- Animation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003b', '40000000-0000-4000-a000-000000000026', '2D Animation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('2D Animation')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003c', '40000000-0000-4000-a000-000000000026', 'Digital Animation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Digital Animation')
);

-- Video Editing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003d', '40000000-0000-4000-a000-000000000027', 'Video Production'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Video Production')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003e', '40000000-0000-4000-a000-000000000027', 'Post-Production'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Post-Production')
);

-- 3D Modeling
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-00000000003f', '40000000-0000-4000-a000-000000000028', '3D Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('3D Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000040', '40000000-0000-4000-a000-000000000028', '3D Rendering'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('3D Rendering')
);

-- AR/VR Design
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000041', '40000000-0000-4000-a000-000000000029', 'Augmented Reality Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Augmented Reality Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000042', '40000000-0000-4000-a000-000000000029', 'Virtual Reality Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Virtual Reality Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000043', '40000000-0000-4000-a000-000000000029', 'XR Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('XR Design')
);

-- Design Thinking
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000044', '40000000-0000-4000-a000-00000000002a', 'Human-Centered Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Human-Centered Design')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000045', '40000000-0000-4000-a000-00000000002a', 'HCD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HCD')
);

-- Design Strategy
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000046', '40000000-0000-4000-a000-00000000002b', 'Strategic Design'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Strategic Design')
);

-- Design Leadership
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000047', '40000000-0000-4000-a000-00000000002c', 'Design Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Design Management')
);

-- Cross-functional Design Collaboration
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000048', '40000000-0000-4000-a000-00000000002d', 'Design Ops'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Design Ops')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '41000000-0000-4000-a000-000000000049', '40000000-0000-4000-a000-00000000002d', 'DesignOps'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DesignOps')
);

-- ════════════════════════════════════════════════════════════════════
-- BUSINESS_SALES ALIASES (73 aliases for 44 skills)
-- ════════════════════════════════════════════════════════════════════

-- Sales
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000001', '50000000-0000-4000-a000-000000000001', 'Selling'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Selling')
);

-- B2B Sales
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000002', '50000000-0000-4000-a000-000000000002', 'Business-to-Business Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business-to-Business Sales')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000003', '50000000-0000-4000-a000-000000000002', 'Enterprise Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Enterprise Sales')
);

-- B2C Sales
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000004', '50000000-0000-4000-a000-000000000003', 'Business-to-Consumer Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business-to-Consumer Sales')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000005', '50000000-0000-4000-a000-000000000003', 'Consumer Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Consumer Sales')
);

-- Account Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000006', '50000000-0000-4000-a000-000000000004', 'Account Mgmt'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Account Mgmt')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000007', '50000000-0000-4000-a000-000000000004', 'Key Account Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Key Account Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000008', '50000000-0000-4000-a000-000000000004', 'KAM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KAM')
);

-- Sales Strategy
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000009', '50000000-0000-4000-a000-000000000005', 'Sales Planning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sales Planning')
);

-- Pipeline Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000a', '50000000-0000-4000-a000-000000000006', 'Sales Pipeline'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sales Pipeline')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000b', '50000000-0000-4000-a000-000000000006', 'Deal Pipeline'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Deal Pipeline')
);

-- Cold Outreach
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000c', '50000000-0000-4000-a000-000000000007', 'Cold Calling'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cold Calling')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000d', '50000000-0000-4000-a000-000000000007', 'Cold Email'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cold Email')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000e', '50000000-0000-4000-a000-000000000007', 'Outbound Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Outbound Sales')
);

-- Sales Negotiation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000000f', '50000000-0000-4000-a000-000000000008', 'Negotiation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Negotiation')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000010', '50000000-0000-4000-a000-000000000008', 'Deal Negotiation'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Deal Negotiation')
);

-- Closing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000011', '50000000-0000-4000-a000-000000000009', 'Deal Closing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Deal Closing')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000012', '50000000-0000-4000-a000-000000000009', 'Sales Closing'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sales Closing')
);

-- Territory Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000013', '50000000-0000-4000-a000-00000000000a', 'Territory Planning'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Territory Planning')
);

-- Salesforce CRM
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000014', '50000000-0000-4000-a000-00000000000b', 'Salesforce'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Salesforce')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000015', '50000000-0000-4000-a000-00000000000b', 'SFDC'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SFDC')
);

-- HubSpot CRM
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000016', '50000000-0000-4000-a000-00000000000c', 'HubSpot Sales'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('HubSpot Sales')
);

-- ZoomInfo
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000017', '50000000-0000-4000-a000-00000000000e', 'Zoom Info'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Zoom Info')
);

-- LinkedIn Sales Navigator
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000018', '50000000-0000-4000-a000-00000000000f', 'Sales Navigator'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Sales Navigator')
);

-- Gong
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000019', '50000000-0000-4000-a000-000000000010', 'Gong.io'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Gong.io')
);

-- Outreach
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001a', '50000000-0000-4000-a000-000000000011', 'Outreach.io'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Outreach.io')
);

-- Business Development
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001b', '50000000-0000-4000-a000-000000000012', 'Biz Dev'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Biz Dev')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001c', '50000000-0000-4000-a000-000000000012', 'BD'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BD')
);

-- Strategic Planning
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001d', '50000000-0000-4000-a000-000000000013', 'Strategy Development'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Strategy Development')
);

-- Partnership Development
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001e', '50000000-0000-4000-a000-000000000014', 'Partner Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Partner Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000001f', '50000000-0000-4000-a000-000000000014', 'Channel Partnerships'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Channel Partnerships')
);

-- Market Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000020', '50000000-0000-4000-a000-000000000015', 'Market Intelligence'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Market Intelligence')
);

-- Business Intelligence
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000021', '50000000-0000-4000-a000-000000000016', 'BI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BI')
);

-- Stakeholder Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000022', '50000000-0000-4000-a000-000000000017', 'Stakeholder Engagement'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Stakeholder Engagement')
);

-- Vendor Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000023', '50000000-0000-4000-a000-000000000018', 'Supplier Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Supplier Management')
);

-- Contract Negotiation
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000024', '50000000-0000-4000-a000-000000000019', 'Contract Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Contract Management')
);

-- Project Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000025', '50000000-0000-4000-a000-00000000001a', 'PM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('PM')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000026', '50000000-0000-4000-a000-00000000001a', 'Project Mgmt'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Project Mgmt')
);

-- Operations Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000027', '50000000-0000-4000-a000-00000000001b', 'Ops Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Ops Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000028', '50000000-0000-4000-a000-00000000001b', 'Business Operations'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business Operations')
);

-- Supply Chain Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000029', '50000000-0000-4000-a000-00000000001c', 'SCM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('SCM')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002a', '50000000-0000-4000-a000-00000000001c', 'Supply Chain'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Supply Chain')
);

-- Inventory Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002b', '50000000-0000-4000-a000-00000000001d', 'Stock Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Stock Management')
);

-- Process Improvement
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002c', '50000000-0000-4000-a000-00000000001e', 'Business Process Improvement'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business Process Improvement')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002d', '50000000-0000-4000-a000-00000000001e', 'BPI'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BPI')
);

-- Lean Six Sigma
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002e', '50000000-0000-4000-a000-00000000001f', 'Six Sigma'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Six Sigma')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000002f', '50000000-0000-4000-a000-00000000001f', 'Lean'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Lean')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000030', '50000000-0000-4000-a000-00000000001f', 'LSS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('LSS')
);

-- Change Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000031', '50000000-0000-4000-a000-000000000020', 'Organizational Change'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Organizational Change')
);

-- Risk Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000032', '50000000-0000-4000-a000-000000000021', 'Enterprise Risk Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Enterprise Risk Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000033', '50000000-0000-4000-a000-000000000021', 'ERM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('ERM')
);

-- Business Analysis
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000034', '50000000-0000-4000-a000-000000000022', 'BA'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('BA')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000035', '50000000-0000-4000-a000-000000000022', 'Business Analyst Skills'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business Analyst Skills')
);

-- Data-Driven Decision Making
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000036', '50000000-0000-4000-a000-000000000023', 'DDDM'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('DDDM')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000037', '50000000-0000-4000-a000-000000000023', 'Data-Informed Decisions'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Data-Informed Decisions')
);

-- KPI Tracking
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000038', '50000000-0000-4000-a000-000000000024', 'KPI Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('KPI Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000039', '50000000-0000-4000-a000-000000000024', 'Metrics'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Metrics')
);

-- Revenue Operations
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003a', '50000000-0000-4000-a000-000000000025', 'RevOps'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RevOps')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003b', '50000000-0000-4000-a000-000000000025', 'Rev Ops'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Rev Ops')
);

-- Customer Success
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003c', '50000000-0000-4000-a000-000000000026', 'CS'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('CS')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003d', '50000000-0000-4000-a000-000000000026', 'Customer Success Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Customer Success Management')
);

-- Client Relations
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003e', '50000000-0000-4000-a000-000000000027', 'Client Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Client Management')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-00000000003f', '50000000-0000-4000-a000-000000000027', 'Client Services'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Client Services')
);

-- Presentation Skills
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000040', '50000000-0000-4000-a000-000000000028', 'Presentations'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Presentations')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000041', '50000000-0000-4000-a000-000000000028', 'Slide Decks'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Slide Decks')
);

-- Public Speaking
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000042', '50000000-0000-4000-a000-000000000029', 'Speaking Engagements'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Speaking Engagements')
);

-- Executive Communication
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000043', '50000000-0000-4000-a000-00000000002a', 'Exec Communication'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Exec Communication')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000044', '50000000-0000-4000-a000-00000000002a', 'C-Suite Communication'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('C-Suite Communication')
);

-- Proposal Writing
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000045', '50000000-0000-4000-a000-00000000002b', 'RFP Responses'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('RFP Responses')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000046', '50000000-0000-4000-a000-00000000002b', 'Business Proposals'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Business Proposals')
);

-- Cross-functional Leadership
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000047', '50000000-0000-4000-a000-00000000002c', 'Cross-functional Collaboration'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Cross-functional Collaboration')
);

-- Team Management
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000048', '50000000-0000-4000-a000-00000000002d', 'Team Leadership'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('Team Leadership')
);
INSERT INTO public.skill_aliases (id, skill_id, alias)
SELECT '51000000-0000-4000-a000-000000000049', '50000000-0000-4000-a000-00000000002d', 'People Management'
WHERE NOT EXISTS (
    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('People Management')
);

