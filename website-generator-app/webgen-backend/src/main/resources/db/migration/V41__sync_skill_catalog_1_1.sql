-- Flyway V41: Sync canonical skill catalog.
-- Catalog-Version: 1.1
-- Source: seed/skills.v1.json
-- Existing canonical IDs are preserved and unresolved claims are backfilled.

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000001', 'JavaScript', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000002', 'TypeScript', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000003', 'Python', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000004', 'Java', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000005', 'C#', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000006', 'C++', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000007', 'C', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000008', 'Go', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000009', 'Rust', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000a', 'Ruby', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000b', 'PHP', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000c', 'Swift', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000d', 'Kotlin', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000e', 'Scala', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000f', 'R', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000010', 'MATLAB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000011', 'Perl', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000012', 'Haskell', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000013', 'Elixir', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000014', 'Dart', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000015', 'Lua', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000016', 'Shell Scripting', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000017', 'SQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000018', 'HTML', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000019', 'CSS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001a', 'React', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001b', 'Angular', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001c', 'Vue.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001d', 'Svelte', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001e', 'Next.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001f', 'Nuxt.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000020', 'Gatsby', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000021', 'Ember.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000022', 'Backbone.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000023', 'jQuery', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000024', 'Bootstrap', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000025', 'Tailwind CSS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000026', 'Material UI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000027', 'Chakra UI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000028', 'Ant Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000029', 'Node.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002a', 'Express.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002b', 'Django', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002c', 'Flask', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002d', 'Spring Boot', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002e', 'Ruby on Rails', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002f', 'ASP.NET', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000030', 'FastAPI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000031', 'Laravel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000032', 'NestJS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000033', 'Gin', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000034', 'Fiber', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000035', 'Phoenix', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000036', 'Actix Web', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000037', 'Koa.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000038', 'PostgreSQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000039', 'MySQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003a', 'MongoDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003b', 'Redis', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003c', 'Elasticsearch', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003d', 'SQLite', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003e', 'Oracle Database', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003f', 'Microsoft SQL Server', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000040', 'Cassandra', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000041', 'DynamoDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000042', 'Neo4j', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000043', 'CouchDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000044', 'Firebase Realtime Database', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000045', 'InfluxDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000046', 'Firestore', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000047', 'Amazon Web Services', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000048', 'Google Cloud Platform', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000049', 'Microsoft Azure', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004a', 'Docker', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004b', 'Kubernetes', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004c', 'Terraform', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004d', 'Ansible', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004e', 'Jenkins', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004f', 'GitHub Actions', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000050', 'GitLab CI/CD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000051', 'CircleCI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000052', 'Nginx', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000053', 'Apache HTTP Server', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000054', 'Vercel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000055', 'Netlify', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000056', 'Heroku', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000057', 'DigitalOcean', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000058', 'Cloudflare', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000059', 'Pulumi', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005a', 'Vagrant', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005b', 'Git', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005c', 'Linux', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005d', 'CI/CD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005e', 'Prometheus', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005f', 'Grafana', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000060', 'Datadog', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000061', 'New Relic', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000062', 'Splunk', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000063', 'ELK Stack', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000064', 'Helm', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000065', 'ArgoCD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000066', 'HashiCorp Vault', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000067', 'Consul', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000068', 'Istio', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000069', 'Service Mesh', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006a', 'TensorFlow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006b', 'PyTorch', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006c', 'Scikit-learn', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006d', 'Pandas', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006e', 'NumPy', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006f', 'Apache Spark', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000070', 'Apache Kafka', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000071', 'Apache Airflow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000072', 'dbt', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000073', 'Snowflake', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000074', 'BigQuery', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000075', 'Amazon Redshift', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000076', 'Tableau', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000077', 'Power BI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000078', 'Looker', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000079', 'Hadoop', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007a', 'Apache Hive', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007b', 'Presto', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007c', 'MLflow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007d', 'Jupyter', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007e', 'React Native', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007f', 'Flutter', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000080', 'iOS Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000081', 'Android Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000082', 'Xcode', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000083', 'Android Studio', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000084', 'SwiftUI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000085', 'Jetpack Compose', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000086', 'Expo', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000087', 'Ionic', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000088', 'Jest', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000089', 'Cypress', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008a', 'Selenium', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008b', 'Playwright', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008c', 'JUnit', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008d', 'pytest', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008e', 'Mocha', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008f', 'Chai', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000090', 'TestNG', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000091', 'Robot Framework', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000092', 'OWASP', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000093', 'Penetration Testing', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000094', 'Cryptography', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000095', 'OAuth', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000096', 'JWT', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000097', 'SSL/TLS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000098', 'Firewall Management', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000099', 'VPN', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009a', 'SIEM', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009b', 'SOC Operations', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009c', 'REST API Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009d', 'GraphQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009e', 'Microservices Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009f', 'Event-Driven Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a0', 'Domain-Driven Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a1', 'Agile', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a2', 'System Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a3', 'Data Structures and Algorithms', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a4', 'Object-Oriented Programming', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a5', 'Functional Programming', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a6', 'Design Patterns', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a7', 'Clean Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a8', 'Test-Driven Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a9', 'WebSockets', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000aa', 'gRPC', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ab', 'Webpack', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ac', 'Vite', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ad', 'Babel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ae', 'ESLint', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000af', 'Prettier', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b0', 'Storybook', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b1', 'Postman', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b2', 'Swagger', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b3', 'RabbitMQ', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b4', 'Apache Maven', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Amazon EC2', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Amazon ECS', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Amazon S3', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('AWS Application Load Balancer', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Supabase', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Flyway', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('Retrieval-Augmented Generation', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (name, category, weight)
VALUES ('LLM API Integration', 'engineering', 1.0000)
ON CONFLICT (lower(name)) DO UPDATE
SET category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000001', 'SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000002', 'Technical SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000003', 'Keyword Research', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000004', 'Link Building', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000005', 'On-Page SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000006', 'Off-Page SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000007', 'Local SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000008', 'SEO Auditing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000009', 'Schema Markup', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000a', 'Core Web Vitals', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000b', 'Content Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000c', 'Copywriting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000d', 'Content Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000e', 'Blog Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000f', 'Technical Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000010', 'Ghostwriting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000011', 'Editorial Planning', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000012', 'Content Distribution', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000013', 'Brand Storytelling', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000014', 'UX Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000015', 'Social Media Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000016', 'Instagram Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000017', 'Facebook Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000018', 'LinkedIn Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000019', 'TikTok Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001a', 'Twitter Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001b', 'Pinterest Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001c', 'YouTube Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001d', 'Influencer Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001e', 'Community Management', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001f', 'Google Ads', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000020', 'Pay-Per-Click Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000021', 'Display Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000022', 'Programmatic Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000023', 'Retargeting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000024', 'Facebook Ads Manager', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000025', 'Conversion Rate Optimization', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000026', 'A/B Testing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000027', 'Attribution Modeling', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000028', 'Performance Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000029', 'Email Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002a', 'Mailchimp', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002b', 'HubSpot Email', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002c', 'Marketing Automation', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002d', 'Drip Campaigns', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002e', 'Newsletter Management', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002f', 'Email Deliverability', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000030', 'Klaviyo', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000031', 'Google Analytics', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000032', 'Marketing Data Analysis', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000033', 'Google Tag Manager', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000034', 'Mixpanel', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000035', 'Amplitude', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000036', 'Hotjar', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000037', 'Heap Analytics', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000038', 'Segment', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000039', 'Brand Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003a', 'Market Research', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003b', 'Competitive Analysis', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003c', 'Go-to-Market Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003d', 'Product Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003e', 'Growth Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003f', 'Brand Identity', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000040', 'Positioning', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000041', 'Public Relations', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000042', 'Press Releases', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000043', 'Media Relations', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000044', 'Crisis Communications', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000045', 'Thought Leadership', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000046', 'Event Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000047', 'Sponsorship Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000048', 'Podcast Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000049', 'HubSpot', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004a', 'Salesforce Marketing Cloud', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004b', 'Marketo', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004c', 'Hootsuite', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004d', 'Buffer', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004e', 'Canva', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004f', 'Ahrefs', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000050', 'SEMrush', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000001', 'Financial Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000002', 'Financial Reporting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000003', 'Financial Modeling', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000004', 'Budgeting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000005', 'Forecasting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000006', 'Cash Flow Management', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000007', 'Variance Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000008', 'Cost Accounting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000009', 'Revenue Recognition', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000a', 'Financial Planning and Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000b', 'Tax Preparation', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000c', 'Tax Planning', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000d', 'Corporate Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000e', 'Individual Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000f', 'Sales Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000010', 'Tax Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000011', 'International Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000012', 'Transfer Pricing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000013', 'Internal Auditing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000014', 'External Auditing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000015', 'SOX Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000016', 'Risk Assessment', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000017', 'Fraud Detection', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000018', 'Audit Planning', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000019', 'Internal Controls', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001a', 'QuickBooks', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001b', 'SAP', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001c', 'Oracle Financials', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001d', 'Xero', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001e', 'NetSuite', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001f', 'Sage', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000020', 'Microsoft Dynamics 365', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000021', 'BlackLine', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000022', 'GAAP', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000023', 'IFRS', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000024', 'Regulatory Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000025', 'Anti-Money Laundering', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000026', 'Know Your Customer', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000027', 'SEC Reporting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000028', 'Accounts Payable', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000029', 'Accounts Receivable', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002a', 'Payroll', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002b', 'General Ledger', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002c', 'Bank Reconciliation', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002d', 'Fixed Assets', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000001', 'UX Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000002', 'User Research', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000003', 'Wireframing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000004', 'Prototyping', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000005', 'Usability Testing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000006', 'Information Architecture', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000007', 'Interaction Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000008', 'Design-Oriented Writing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000009', 'Accessibility Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000a', 'Design Systems', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000b', 'UI Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000c', 'Visual Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000d', 'Responsive Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000e', 'Mobile UI Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000f', 'Web Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000010', 'Icon Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000011', 'Color Theory', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000012', 'Layout Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000013', 'Graphic Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000014', 'Logo Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000015', 'Brand Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000016', 'Print Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000017', 'Packaging Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000018', 'Typography', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000019', 'Illustration', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001a', 'Infographics', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001b', 'Figma', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001c', 'Sketch', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001d', 'Adobe Photoshop', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001e', 'Adobe Illustrator', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001f', 'Adobe XD', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000020', 'InVision', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000021', 'Framer', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000022', 'Adobe InDesign', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000023', 'Adobe After Effects', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000024', 'Blender', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000025', 'Motion Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000026', 'Animation', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000027', 'Video Editing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000028', '3D Modeling', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000029', 'AR/VR Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002a', 'Design Thinking', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002b', 'Design Strategy', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002c', 'Design Leadership', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002d', 'Cross-functional Design Collaboration', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000001', 'Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000002', 'B2B Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000003', 'B2C Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000004', 'Account Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000005', 'Sales Strategy', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000006', 'Pipeline Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000007', 'Cold Outreach', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000008', 'Sales Negotiation', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000009', 'Closing', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000a', 'Territory Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000b', 'Salesforce CRM', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000c', 'HubSpot CRM', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000d', 'Pipedrive', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000e', 'ZoomInfo', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000f', 'LinkedIn Sales Navigator', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000010', 'Gong', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000011', 'Outreach', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000012', 'Business Development', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000013', 'Strategic Planning', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000014', 'Partnership Development', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000015', 'Market Analysis', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000016', 'Business Intelligence', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000017', 'Stakeholder Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000018', 'Vendor Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000019', 'Contract Negotiation', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001a', 'Project Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001b', 'Operations Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001c', 'Supply Chain Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001d', 'Inventory Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001e', 'Process Improvement', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001f', 'Lean Six Sigma', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000020', 'Change Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000021', 'Risk Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000022', 'Business Analysis', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000023', 'Data-Driven Decision Making', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000024', 'KPI Tracking', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000025', 'Revenue Operations', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000026', 'Customer Success', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000027', 'Client Relations', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000028', 'Presentation Skills', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000029', 'Public Speaking', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002a', 'Executive Communication', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002b', 'Proposal Writing', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002c', 'Cross-functional Leadership', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002d', 'Team Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    weight = EXCLUDED.weight,
    updated_at = now();

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JavaScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ECMAScript'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JavaScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ES6'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JavaScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ES2015+'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JavaScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vanilla JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JavaScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('TypeScript')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Python 3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Python')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Python3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Python')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CPython'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Python')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Java SE'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Java')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Java EE'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Java')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'J2EE'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Java')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Core Java'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Java')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CSharp'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C#')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C Sharp'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C#')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CPP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C++')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C Plus Plus'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C++')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C Language'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ANSI C'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C99'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C11'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('C')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Golang'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Go')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rust Lang'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Rust')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rustlang'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Rust')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ruby Language'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ruby')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PHP 8'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('PHP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PHP7'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('PHP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Swift Language'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Swift')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Apple Swift'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Swift')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Kotlin/JVM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Kotlin')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'R Language'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('R')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'R Programming'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('R')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Bash'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Shell Scripting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Shell'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Shell Scripting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Bash Scripting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Shell Scripting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Zsh'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Shell Scripting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'sh'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Shell Scripting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Structured Query Language'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HTML5'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HTML')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CSS3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CSS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cascading Style Sheets'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CSS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'React.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('React')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ReactJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('React')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'React JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('React')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Angular 2+'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Angular')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AngularJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Angular')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Angular.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Angular')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vue'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vue.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'VueJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vue.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vue JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vue.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vue 3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vue.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SvelteKit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Svelte')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'NextJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Next.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Next JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Next.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'NuxtJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Nuxt.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Nuxt'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Nuxt.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GatsbyJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Gatsby')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Gatsby.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Gatsby')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'EmberJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ember.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ember'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ember.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BackboneJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Backbone.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Backbone'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Backbone.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Bootstrap 5'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Bootstrap')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Bootstrap CSS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Bootstrap')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TailwindCSS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tailwind CSS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tailwind'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tailwind CSS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'MUI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Material UI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Material-UI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Material UI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ChakraUI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Chakra UI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AntD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ant Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ant Design System'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ant Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'NodeJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Node.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Node JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Node.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Node'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Node.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ExpressJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Express.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Express'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Express.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Django Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Django')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Flask Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Flask')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SpringBoot'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Spring Boot')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Spring Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Spring Boot')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Spring'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Spring Boot')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rails'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ruby on Rails')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RoR'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ruby on Rails')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ASP.NET Core'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ASP.NET')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ASPNET'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ASP.NET')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '.NET'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ASP.NET')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DotNet'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ASP.NET')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Dotnet Core'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ASP.NET')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Laravel Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Laravel')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Nest.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('NestJS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Nest JS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('NestJS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Gin Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Gin')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Gin-Gonic'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Gin')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GoFiber'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fiber')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Go Fiber'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fiber')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Phoenix Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Phoenix')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Actix'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Actix Web')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Actix-Web'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Actix Web')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KoaJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Koa.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Koa'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Koa.js')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Postgres'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('PostgreSQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PG'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('PostgreSQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'psql'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('PostgreSQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'MariaDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('MySQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Mongo'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('MongoDB')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Redis Cache'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Redis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Elastic Search'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Elasticsearch')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ES'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Elasticsearch')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ELK'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Elasticsearch')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Oracle DB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Oracle Database')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OracleDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Oracle Database')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Oracle'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Oracle Database')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'MSSQL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft SQL Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'MS SQL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft SQL Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SQL Server'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft SQL Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'T-SQL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft SQL Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Apache Cassandra'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cassandra')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS DynamoDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('DynamoDB')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Amazon DynamoDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('DynamoDB')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Apache CouchDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CouchDB')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Firebase DB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Firebase Realtime Database')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RTDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Firebase Realtime Database')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Influx'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('InfluxDB')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cloud Firestore'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Firestore')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google Firestore'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Firestore')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon Web Services')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GCP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Cloud Platform')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google Cloud'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Cloud Platform')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Azure'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft Azure')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Docker Containers'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Docker')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Containerization'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Docker')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'K8s'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Kubernetes')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HashiCorp Terraform'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Terraform')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TF'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Terraform')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ansible Automation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ansible')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Jenkins CI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jenkins')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GH Actions'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GitHub Actions')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GitLab CI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GitLab CI/CD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GitLab Pipelines'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GitLab CI/CD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Circle CI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CircleCI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Apache'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache HTTP Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'httpd'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache HTTP Server')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Digital Ocean'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('DigitalOcean')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('DigitalOcean')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cloudflare CDN'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cloudflare')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HashiCorp Vagrant'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vagrant')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Git Version Control'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Git')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Git VCS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Git')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Linux Administration'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Linux')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Linux Sysadmin'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Linux')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ubuntu'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Linux')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CentOS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Linux')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RHEL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Linux')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Continuous Integration'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CI/CD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Continuous Delivery'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CI/CD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Continuous Deployment'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('CI/CD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Prometheus Monitoring'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Prometheus')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Grafana Dashboards'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Grafana')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'NewRelic'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('New Relic')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Elastic Stack'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ELK Stack')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Logstash'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ELK Stack')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Kibana'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ELK Stack')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Helm Charts'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Helm')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Argo CD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ArgoCD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vault'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HashiCorp Vault')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HashiCorp Consul'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Consul')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Istio Service Mesh'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Istio')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'sklearn'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Scikit-learn')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Scikit Learn'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Scikit-learn')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Spark'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Spark')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PySpark'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Spark')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Kafka'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Kafka')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Airflow'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Airflow')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'dbt Core'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('dbt')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'dbt Cloud'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('dbt')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Data Build Tool'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('dbt')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Snowflake Data Cloud'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Snowflake')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google BigQuery'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('BigQuery')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GBQ'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('BigQuery')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Redshift'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon Redshift')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS Redshift'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon Redshift')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PowerBI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Power BI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Microsoft Power BI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Power BI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google Looker'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Looker')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Apache Hadoop'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Hadoop')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HDFS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Hadoop')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Hive'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Hive')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PrestoDB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Presto')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Trino'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Presto')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ML Flow'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('MLflow')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Jupyter Notebook'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jupyter')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Jupyter Notebooks'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jupyter')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JupyterLab'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jupyter')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ReactNative'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('React Native')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'React-Native'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('React Native')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Flutter SDK'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Flutter')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'iOS Dev'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('iOS Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'iPhone Development'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('iOS Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Android Dev'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Android Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Swift UI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SwiftUI')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Compose'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jetpack Compose')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Expo SDK'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Expo')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ionic Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ionic')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Jest Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Jest')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cypress.io'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cypress')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Selenium WebDriver'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Selenium')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Playwright Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Playwright')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JUnit 5'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JUnit')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JUnit4'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JUnit')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'py.test'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('pytest')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Mocha.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Mocha')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Chai.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Chai')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RobotFramework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Robot Framework')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OWASP Top 10'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('OWASP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Pen Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Penetration Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Pentesting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Penetration Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Pentest'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Penetration Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Encryption'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cryptography')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OAuth 2.0'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('OAuth')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OAuth2'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('OAuth')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JSON Web Tokens'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JWT')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JSON Web Token'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('JWT')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SSL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SSL/TLS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TLS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SSL/TLS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HTTPS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SSL/TLS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Firewalls'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Firewall Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Virtual Private Network'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('VPN')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Security Information and Event Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SIEM')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SOC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SOC Operations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Security Operations Center'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SOC Operations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'REST'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('REST API Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RESTful'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('REST API Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'REST APIs'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('REST API Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RESTful APIs'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('REST API Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Graph QL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GraphQL')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Microservices'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microservices Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Micro Services'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microservices Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'EDA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Event-Driven Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Event Driven Architecture'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Event-Driven Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DDD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Domain-Driven Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Agile Methodology'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Agile')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Scrum'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Agile')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Agile/Scrum'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Agile')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Kanban'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Agile')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Systems Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('System Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Distributed Systems'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('System Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DSA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Data Structures and Algorithms')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Data Structures & Algorithms'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Data Structures and Algorithms')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Algorithms'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Data Structures and Algorithms')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OOP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Object-Oriented Programming')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Object Oriented Programming'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Object-Oriented Programming')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'FP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Functional Programming')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Software Design Patterns'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Patterns')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GoF Patterns'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Patterns')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Hexagonal Architecture'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Clean Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Onion Architecture'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Clean Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TDD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Test-Driven Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Web Sockets'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('WebSockets')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Socket.io'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('WebSockets')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google RPC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('gRPC')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ViteJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vite')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Vite.js'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vite')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BabelJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Babel')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'StorybookJS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Storybook')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Postman API'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Postman')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OpenAPI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Swagger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Swagger/OpenAPI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Swagger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'OpenAPI Specification'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Swagger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rabbit MQ'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('RabbitMQ')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RabbitMQ Messaging'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('RabbitMQ')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Maven'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Apache Maven')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'EC2'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon EC2')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS EC2'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon EC2')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ECS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon ECS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS ECS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon ECS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Elastic Container Service'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon ECS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'S3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon S3')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AWS S3'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon S3')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Simple Storage Service'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amazon S3')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ALB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('AWS Application Load Balancer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Application Load Balancer'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('AWS Application Load Balancer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Flyway Database Migrations'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Flyway')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RAG'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Retrieval-Augmented Generation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RAG Pipeline'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Retrieval-Augmented Generation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RAG Pipelines'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Retrieval-Augmented Generation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'LLM API'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('LLM API Integration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'LLM APIs'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('LLM API Integration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Large Language Model APIs'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('LLM API Integration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Search Engine Optimization'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tech SEO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Technical SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KW Research'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Keyword Research')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Backlink Strategy'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Link Building')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Backlinks'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Link Building')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'On Page SEO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('On-Page SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'On-Site SEO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('On-Page SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Off Page SEO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Off-Page SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Off-Site SEO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Off-Page SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google My Business'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Local SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GMB'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Local SEO')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SEO Audit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEO Auditing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Site Audit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEO Auditing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Structured Data'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Schema Markup')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'JSON-LD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Schema Markup')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CWV'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Core Web Vitals')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Page Speed Optimization'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Core Web Vitals')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Content Mktg'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Content Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Copy Writing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Copywriting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ad Copy'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Copywriting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Content Planning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Content Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Blogging'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Blog Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Blog Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Blog Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tech Writing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Technical Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Documentation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Technical Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ghost Writing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Ghostwriting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Editorial Calendar'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Editorial Planning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Content Syndication'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Content Distribution')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Narrative'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Storytelling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UX Copywriting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UX Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Microcopy'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UX Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SMM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Social Media Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Social Media Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Social Media Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Instagram Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Instagram Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'IG Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Instagram Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Facebook Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Facebook Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'FB Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Facebook Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Meta Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Facebook Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'LinkedIn Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('LinkedIn Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TikTok Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('TikTok Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'X Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Twitter Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Twitter/X'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Twitter Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Pinterest Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Pinterest Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'YouTube Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('YouTube Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Video Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('YouTube Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Influencer Outreach'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Influencer Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Creator Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Influencer Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Community Building'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Community Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Online Community'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Community Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google AdWords'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Ads')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AdWords'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Ads')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google PPC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Ads')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PPC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Pay-Per-Click Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Paid Search'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Pay-Per-Click Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Display Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Display Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Banner Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Display Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Programmatic Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Programmatic Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Programmatic Media Buying'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Programmatic Advertising')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Remarketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Retargeting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Retargeting Ads'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Retargeting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Meta Ads Manager'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Facebook Ads Manager')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'FB Ads Manager'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Facebook Ads Manager')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CRO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Conversion Rate Optimization')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Split Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('A/B Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AB Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('A/B Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Multivariate Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('A/B Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Marketing Attribution'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Attribution Modeling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Multi-Touch Attribution'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Attribution Modeling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Growth Performance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Performance Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Email Campaigns'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Email Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Email Mktg'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Email Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HubSpot Email Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HubSpot Email')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Marketing Ops'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Marketing Automation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'MktOps'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Marketing Automation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Drip Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Drip Campaigns')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Automated Email Sequences'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Drip Campaigns')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Email Newsletters'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Newsletter Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Inbox Placement'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Email Deliverability')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Email Reputation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Email Deliverability')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GA4'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Analytics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Analytics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Google Analytics 4'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Analytics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Marketing Analytics'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Marketing Data Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GTM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Google Tag Manager')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Amplitude Analytics'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Amplitude')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Heap'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Heap Analytics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Twilio Segment'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Segment')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Branding'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Development'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Consumer Research'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Market Research')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Competitor Research'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Competitive Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Competitive Intelligence'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Competitive Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GTM Strategy'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Go-to-Market Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Go to Market'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Go-to-Market Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PMM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Product Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Product Mktg'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Product Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Growth Hacking'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Growth Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Guidelines'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Identity')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Visual Identity'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Identity')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Positioning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Positioning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Market Positioning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Positioning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PR'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Public Relations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Press Release Writing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Press Releases')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Media Outreach'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Media Relations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Crisis Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Crisis Communications')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Crisis PR'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Crisis Communications')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Event Planning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Event Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Event Promotion'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Event Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sponsorships'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sponsorship Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Podcast Production'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Podcast Marketing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HubSpot CRM Marketing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HubSpot')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HubSpot Marketing Hub'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HubSpot')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SFMC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Salesforce Marketing Cloud')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Marketing Cloud'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Salesforce Marketing Cloud')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Adobe Marketo'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Marketo')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Marketo Engage'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Marketo')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Buffer App'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Buffer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Canva Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Canva')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Financial Analyst Skills'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Financial Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Financial Statements'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Financial Reporting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Financial Models'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Financial Modeling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Budget Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Budgeting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Budget Planning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Budgeting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Financial Forecasting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Forecasting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Revenue Forecasting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Forecasting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cash Flow Analysis'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cash Flow Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cash Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cash Flow Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Budget Variance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Variance Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cost Analysis'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cost Accounting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Costing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cost Accounting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ASC 606'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Revenue Recognition')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rev Rec'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Revenue Recognition')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'FP&A'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Financial Planning and Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'FPA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Financial Planning and Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tax Prep'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tax Preparation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tax Filing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tax Preparation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tax Strategy'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tax Planning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Corporate Taxation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Corporate Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Corporate Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Personal Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Individual Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Individual Taxation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Individual Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sales & Use Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Indirect Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Tax Regulatory Compliance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Tax Compliance')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Global Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('International Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cross-Border Tax'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('International Tax')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'TP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Transfer Pricing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Internal Audit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Internal Auditing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'External Audit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('External Auditing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Statutory Audit'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('External Auditing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sarbanes-Oxley'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SOX Compliance')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SOX'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SOX Compliance')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SOX 404'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SOX Compliance')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Audit Risk Assessment'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Risk Assessment')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Fraud Prevention'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fraud Detection')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Forensic Accounting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fraud Detection')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Audit Programs'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Audit Planning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Internal Control Framework'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Internal Controls')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'COSO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Internal Controls')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'QuickBooks Online'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('QuickBooks')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'QBO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('QuickBooks')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'QuickBooks Desktop'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('QuickBooks')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SAP ERP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SAP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SAP FICO'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SAP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SAP S/4HANA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SAP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Oracle ERP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Oracle Financials')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Oracle Cloud Financials'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Oracle Financials')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Xero Accounting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Xero')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Oracle NetSuite'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('NetSuite')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'NetSuite ERP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('NetSuite')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sage Intacct'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sage')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sage 50'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sage')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Dynamics 365'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft Dynamics 365')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'D365'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft Dynamics 365')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Dynamics GP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Microsoft Dynamics 365')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BlackLine Accounting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('BlackLine')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'US GAAP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GAAP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Generally Accepted Accounting Principles'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('GAAP')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'International Financial Reporting Standards'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('IFRS')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Financial Compliance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Regulatory Compliance')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AML'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Anti-Money Laundering')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AML Compliance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Anti-Money Laundering')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KYC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Know Your Customer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KYC Compliance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Know Your Customer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SEC Filings'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEC Reporting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '10-K'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEC Reporting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '10-Q'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('SEC Reporting')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AP'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accounts Payable')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'A/P'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accounts Payable')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AR'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accounts Receivable')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'A/R'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accounts Receivable')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Payroll Processing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Payroll')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Payroll Administration'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Payroll')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'GL'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('General Ledger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'G/L'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('General Ledger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'General Ledger Accounting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('General Ledger')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Account Reconciliation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Bank Reconciliation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Reconciliations'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Bank Reconciliation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Fixed Asset Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fixed Assets')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Asset Accounting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Fixed Assets')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'User Experience Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UX Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'User Experience'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UX Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UXD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UX Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UX Research'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('User Research')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UXR'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('User Research')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Wireframes'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Wireframing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Lo-Fi Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Wireframing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rapid Prototyping'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Prototyping')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Hi-Fi Prototyping'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Prototyping')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'User Testing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Usability Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UT'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Usability Testing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'IA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Information Architecture')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'IxD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Interaction Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Design Writing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design-Oriented Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Design Copywriting'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design-Oriented Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'A11y'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accessibility Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'WCAG'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accessibility Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ADA Compliance'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accessibility Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Inclusive Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Accessibility Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Component Libraries'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Systems')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Style Guides'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Systems')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'User Interface Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UI Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'UID'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('UI Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Visual Communication'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Visual Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Responsive Web Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Responsive Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RWD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Responsive Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Mobile-First Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Responsive Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Mobile App Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Mobile UI Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'App UI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Mobile UI Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Website Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Web Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Iconography'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Icon Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Color Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Color Theory')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Grid Systems'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Layout Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Graphics Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Graphic Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Logomark Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Logo Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Mark Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Logo Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Brand Identity Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Brand Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Print Layout'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Print Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Publication Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Print Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Package Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Packaging Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Type Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Typography')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Typographic Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Typography')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Digital Illustration'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Illustration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Infographic Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Infographics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Data Visualization Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Infographics')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Figma Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Figma')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sketch App'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sketch')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Photoshop'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe Photoshop')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe Photoshop')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Illustrator'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe Illustrator')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe Illustrator')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'XD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe XD')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Framer Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Framer')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'InDesign'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe InDesign')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'After Effects'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe After Effects')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'AE'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Adobe After Effects')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Blender 3D'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Blender')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Motion Graphics'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Motion Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '2D Animation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Animation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Digital Animation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Animation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Video Production'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Video Editing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Post-Production'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Video Editing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '3D Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('3D Modeling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, '3D Rendering'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('3D Modeling')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Augmented Reality Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('AR/VR Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Virtual Reality Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('AR/VR Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'XR Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('AR/VR Design')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Human-Centered Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Thinking')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HCD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Thinking')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Strategic Design'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Design Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Design Leadership')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Design Ops'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cross-functional Design Collaboration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DesignOps'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cross-functional Design Collaboration')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Selling'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business-to-Business Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('B2B Sales')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Enterprise Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('B2B Sales')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business-to-Consumer Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('B2C Sales')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Consumer Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('B2C Sales')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Account Mgmt'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Account Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Key Account Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Account Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KAM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Account Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sales Planning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales Strategy')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sales Pipeline'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Pipeline Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Deal Pipeline'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Pipeline Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cold Calling'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cold Outreach')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cold Email'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cold Outreach')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Outbound Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cold Outreach')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Negotiation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales Negotiation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Deal Negotiation'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Sales Negotiation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Deal Closing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Closing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sales Closing'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Closing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Territory Planning'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Territory Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Salesforce'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Salesforce CRM')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SFDC'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Salesforce CRM')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'HubSpot Sales'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('HubSpot CRM')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Zoom Info'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('ZoomInfo')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Sales Navigator'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('LinkedIn Sales Navigator')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Gong.io'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Gong')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Outreach.io'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Outreach')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Biz Dev'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Business Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BD'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Business Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Strategy Development'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Strategic Planning')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Partner Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Partnership Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Channel Partnerships'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Partnership Development')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Market Intelligence'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Market Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Business Intelligence')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Stakeholder Engagement'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Stakeholder Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Supplier Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Vendor Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Contract Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Contract Negotiation')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'PM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Project Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Project Mgmt'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Project Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Ops Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Operations Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business Operations'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Operations Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'SCM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Supply Chain Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Supply Chain'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Supply Chain Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Stock Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Inventory Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business Process Improvement'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Process Improvement')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BPI'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Process Improvement')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Six Sigma'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Lean Six Sigma')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Lean'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Lean Six Sigma')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'LSS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Lean Six Sigma')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Organizational Change'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Change Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Enterprise Risk Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Risk Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'ERM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Risk Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'BA'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Business Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business Analyst Skills'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Business Analysis')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'DDDM'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Data-Driven Decision Making')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Data-Informed Decisions'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Data-Driven Decision Making')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'KPI Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('KPI Tracking')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Metrics'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('KPI Tracking')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RevOps'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Revenue Operations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Rev Ops'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Revenue Operations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'CS'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Customer Success')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Customer Success Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Customer Success')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Client Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Client Relations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Client Services'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Client Relations')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Presentations'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Presentation Skills')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Slide Decks'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Presentation Skills')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Speaking Engagements'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Public Speaking')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Exec Communication'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Executive Communication')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'C-Suite Communication'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Executive Communication')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'RFP Responses'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Proposal Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Business Proposals'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Proposal Writing')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Cross-functional Collaboration'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Cross-functional Leadership')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'Team Leadership'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Team Management')
ON CONFLICT (lower(alias)) DO NOTHING;

INSERT INTO public.skill_aliases (skill_id, alias)
SELECT skill.id, 'People Management'
FROM public.skills AS skill
WHERE lower(skill.name) = lower('Team Management')
ON CONFLICT (lower(alias)) DO NOTHING;

UPDATE public.claims AS claim
SET canonical_skill_id = skill.id,
    updated_at = now()
FROM public.skills AS skill
WHERE claim.canonical_skill_id IS NULL
  AND lower(btrim(claim.raw_value)) = lower(skill.name);

UPDATE public.claims AS claim
SET canonical_skill_id = alias.skill_id,
    updated_at = now()
FROM public.skill_aliases AS alias
WHERE claim.canonical_skill_id IS NULL
  AND lower(btrim(claim.raw_value)) = lower(alias.alias);
