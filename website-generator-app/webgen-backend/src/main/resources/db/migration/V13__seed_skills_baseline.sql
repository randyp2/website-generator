-- Flyway V13: Seed canonical skills baseline.
-- Source: seed/skills.v1.json
-- Generated: 2026-04-13
--
-- Uses id-based upsert so re-running is safe:
--   ON CONFLICT (id) DO UPDATE SET name, category, weight, updated_at.
-- Future additions must go in new migration files (V15+, etc.).

-- ════════════════════════════════════════════════════════════════════
-- ENGINEERING (180 skills)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000001', 'JavaScript', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000002', 'TypeScript', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000003', 'Python', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000004', 'Java', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000005', 'C#', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000006', 'C++', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000007', 'C', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000008', 'Go', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000009', 'Rust', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000a', 'Ruby', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000b', 'PHP', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000c', 'Swift', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000d', 'Kotlin', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000e', 'Scala', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000000f', 'R', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000010', 'MATLAB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000011', 'Perl', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000012', 'Haskell', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000013', 'Elixir', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000014', 'Dart', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000015', 'Lua', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000016', 'Shell Scripting', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000017', 'SQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000018', 'HTML', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000019', 'CSS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001a', 'React', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001b', 'Angular', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001c', 'Vue.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001d', 'Svelte', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001e', 'Next.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000001f', 'Nuxt.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000020', 'Gatsby', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000021', 'Ember.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000022', 'Backbone.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000023', 'jQuery', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000024', 'Bootstrap', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000025', 'Tailwind CSS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000026', 'Material UI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000027', 'Chakra UI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000028', 'Ant Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000029', 'Node.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002a', 'Express.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002b', 'Django', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002c', 'Flask', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002d', 'Spring Boot', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002e', 'Ruby on Rails', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000002f', 'ASP.NET', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000030', 'FastAPI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000031', 'Laravel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000032', 'NestJS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000033', 'Gin', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000034', 'Fiber', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000035', 'Phoenix', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000036', 'Actix Web', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000037', 'Koa.js', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000038', 'PostgreSQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000039', 'MySQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003a', 'MongoDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003b', 'Redis', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003c', 'Elasticsearch', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003d', 'SQLite', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003e', 'Oracle Database', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000003f', 'Microsoft SQL Server', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000040', 'Cassandra', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000041', 'DynamoDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000042', 'Neo4j', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000043', 'CouchDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000044', 'Firebase Realtime Database', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000045', 'InfluxDB', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000046', 'Firestore', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000047', 'Amazon Web Services', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000048', 'Google Cloud Platform', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000049', 'Microsoft Azure', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004a', 'Docker', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004b', 'Kubernetes', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004c', 'Terraform', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004d', 'Ansible', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004e', 'Jenkins', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000004f', 'GitHub Actions', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000050', 'GitLab CI/CD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000051', 'CircleCI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000052', 'Nginx', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000053', 'Apache HTTP Server', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000054', 'Vercel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000055', 'Netlify', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000056', 'Heroku', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000057', 'DigitalOcean', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000058', 'Cloudflare', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000059', 'Pulumi', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005a', 'Vagrant', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005b', 'Git', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005c', 'Linux', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005d', 'CI/CD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005e', 'Prometheus', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000005f', 'Grafana', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000060', 'Datadog', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000061', 'New Relic', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000062', 'Splunk', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000063', 'ELK Stack', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000064', 'Helm', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000065', 'ArgoCD', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000066', 'HashiCorp Vault', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000067', 'Consul', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000068', 'Istio', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000069', 'Service Mesh', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006a', 'TensorFlow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006b', 'PyTorch', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006c', 'Scikit-learn', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006d', 'Pandas', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006e', 'NumPy', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000006f', 'Apache Spark', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000070', 'Apache Kafka', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000071', 'Apache Airflow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000072', 'dbt', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000073', 'Snowflake', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000074', 'BigQuery', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000075', 'Amazon Redshift', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000076', 'Tableau', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000077', 'Power BI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000078', 'Looker', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000079', 'Hadoop', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007a', 'Apache Hive', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007b', 'Presto', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007c', 'MLflow', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007d', 'Jupyter', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007e', 'React Native', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000007f', 'Flutter', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000080', 'iOS Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000081', 'Android Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000082', 'Xcode', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000083', 'Android Studio', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000084', 'SwiftUI', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000085', 'Jetpack Compose', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000086', 'Expo', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000087', 'Ionic', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000088', 'Jest', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000089', 'Cypress', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008a', 'Selenium', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008b', 'Playwright', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008c', 'JUnit', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008d', 'pytest', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008e', 'Mocha', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000008f', 'Chai', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000090', 'TestNG', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000091', 'Robot Framework', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000092', 'OWASP', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000093', 'Penetration Testing', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000094', 'Cryptography', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000095', 'OAuth', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000096', 'JWT', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000097', 'SSL/TLS', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000098', 'Firewall Management', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-000000000099', 'VPN', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009a', 'SIEM', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009b', 'SOC Operations', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009c', 'REST API Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009d', 'GraphQL', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009e', 'Microservices Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-00000000009f', 'Event-Driven Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a0', 'Domain-Driven Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a1', 'Agile', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a2', 'System Design', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a3', 'Data Structures and Algorithms', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a4', 'Object-Oriented Programming', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a5', 'Functional Programming', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a6', 'Design Patterns', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a7', 'Clean Architecture', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a8', 'Test-Driven Development', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000a9', 'WebSockets', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000aa', 'gRPC', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ab', 'Webpack', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ac', 'Vite', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ad', 'Babel', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000ae', 'ESLint', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000af', 'Prettier', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b0', 'Storybook', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b1', 'Postman', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b2', 'Swagger', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b3', 'RabbitMQ', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('10000000-0000-4000-a000-0000000000b4', 'Apache Maven', 'engineering', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

-- ════════════════════════════════════════════════════════════════════
-- MARKETING (80 skills)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000001', 'SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000002', 'Technical SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000003', 'Keyword Research', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000004', 'Link Building', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000005', 'On-Page SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000006', 'Off-Page SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000007', 'Local SEO', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000008', 'SEO Auditing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000009', 'Schema Markup', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000a', 'Core Web Vitals', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000b', 'Content Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000c', 'Copywriting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000d', 'Content Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000e', 'Blog Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000000f', 'Technical Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000010', 'Ghostwriting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000011', 'Editorial Planning', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000012', 'Content Distribution', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000013', 'Brand Storytelling', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000014', 'UX Writing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000015', 'Social Media Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000016', 'Instagram Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000017', 'Facebook Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000018', 'LinkedIn Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000019', 'TikTok Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001a', 'Twitter Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001b', 'Pinterest Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001c', 'YouTube Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001d', 'Influencer Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001e', 'Community Management', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000001f', 'Google Ads', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000020', 'Pay-Per-Click Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000021', 'Display Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000022', 'Programmatic Advertising', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000023', 'Retargeting', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000024', 'Facebook Ads Manager', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000025', 'Conversion Rate Optimization', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000026', 'A/B Testing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000027', 'Attribution Modeling', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000028', 'Performance Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000029', 'Email Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002a', 'Mailchimp', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002b', 'HubSpot Email', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002c', 'Marketing Automation', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002d', 'Drip Campaigns', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002e', 'Newsletter Management', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000002f', 'Email Deliverability', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000030', 'Klaviyo', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000031', 'Google Analytics', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000032', 'Marketing Data Analysis', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000033', 'Google Tag Manager', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000034', 'Mixpanel', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000035', 'Amplitude', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000036', 'Hotjar', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000037', 'Heap Analytics', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000038', 'Segment', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000039', 'Brand Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003a', 'Market Research', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003b', 'Competitive Analysis', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003c', 'Go-to-Market Strategy', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003d', 'Product Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003e', 'Growth Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000003f', 'Brand Identity', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000040', 'Positioning', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000041', 'Public Relations', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000042', 'Press Releases', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000043', 'Media Relations', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000044', 'Crisis Communications', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000045', 'Thought Leadership', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000046', 'Event Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000047', 'Sponsorship Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000048', 'Podcast Marketing', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000049', 'HubSpot', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004a', 'Salesforce Marketing Cloud', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004b', 'Marketo', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004c', 'Hootsuite', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004d', 'Buffer', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004e', 'Canva', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-00000000004f', 'Ahrefs', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('20000000-0000-4000-a000-000000000050', 'SEMrush', 'marketing', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

-- ════════════════════════════════════════════════════════════════════
-- ACCOUNTING (45 skills)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000001', 'Financial Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000002', 'Financial Reporting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000003', 'Financial Modeling', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000004', 'Budgeting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000005', 'Forecasting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000006', 'Cash Flow Management', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000007', 'Variance Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000008', 'Cost Accounting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000009', 'Revenue Recognition', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000a', 'Financial Planning and Analysis', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000b', 'Tax Preparation', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000c', 'Tax Planning', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000d', 'Corporate Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000e', 'Individual Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000000f', 'Sales Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000010', 'Tax Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000011', 'International Tax', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000012', 'Transfer Pricing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000013', 'Internal Auditing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000014', 'External Auditing', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000015', 'SOX Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000016', 'Risk Assessment', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000017', 'Fraud Detection', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000018', 'Audit Planning', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000019', 'Internal Controls', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001a', 'QuickBooks', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001b', 'SAP', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001c', 'Oracle Financials', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001d', 'Xero', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001e', 'NetSuite', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000001f', 'Sage', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000020', 'Microsoft Dynamics 365', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000021', 'BlackLine', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000022', 'GAAP', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000023', 'IFRS', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000024', 'Regulatory Compliance', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000025', 'Anti-Money Laundering', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000026', 'Know Your Customer', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000027', 'SEC Reporting', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000028', 'Accounts Payable', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-000000000029', 'Accounts Receivable', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002a', 'Payroll', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002b', 'General Ledger', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002c', 'Bank Reconciliation', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('30000000-0000-4000-a000-00000000002d', 'Fixed Assets', 'accounting', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

-- ════════════════════════════════════════════════════════════════════
-- DESIGN (45 skills)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000001', 'UX Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000002', 'User Research', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000003', 'Wireframing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000004', 'Prototyping', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000005', 'Usability Testing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000006', 'Information Architecture', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000007', 'Interaction Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000008', 'Design-Oriented Writing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000009', 'Accessibility Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000a', 'Design Systems', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000b', 'UI Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000c', 'Visual Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000d', 'Responsive Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000e', 'Mobile UI Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000000f', 'Web Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000010', 'Icon Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000011', 'Color Theory', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000012', 'Layout Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000013', 'Graphic Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000014', 'Logo Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000015', 'Brand Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000016', 'Print Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000017', 'Packaging Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000018', 'Typography', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000019', 'Illustration', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001a', 'Infographics', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001b', 'Figma', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001c', 'Sketch', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001d', 'Adobe Photoshop', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001e', 'Adobe Illustrator', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000001f', 'Adobe XD', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000020', 'InVision', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000021', 'Framer', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000022', 'Adobe InDesign', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000023', 'Adobe After Effects', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000024', 'Blender', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000025', 'Motion Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000026', 'Animation', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000027', 'Video Editing', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000028', '3D Modeling', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-000000000029', 'AR/VR Design', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002a', 'Design Thinking', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002b', 'Design Strategy', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002c', 'Design Leadership', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('40000000-0000-4000-a000-00000000002d', 'Cross-functional Design Collaboration', 'design', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

-- ════════════════════════════════════════════════════════════════════
-- BUSINESS_SALES (45 skills)
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000001', 'Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000002', 'B2B Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000003', 'B2C Sales', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000004', 'Account Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000005', 'Sales Strategy', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000006', 'Pipeline Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000007', 'Cold Outreach', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000008', 'Sales Negotiation', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000009', 'Closing', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000a', 'Territory Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000b', 'Salesforce CRM', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000c', 'HubSpot CRM', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000d', 'Pipedrive', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000e', 'ZoomInfo', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000000f', 'LinkedIn Sales Navigator', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000010', 'Gong', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000011', 'Outreach', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000012', 'Business Development', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000013', 'Strategic Planning', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000014', 'Partnership Development', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000015', 'Market Analysis', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000016', 'Business Intelligence', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000017', 'Stakeholder Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000018', 'Vendor Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000019', 'Contract Negotiation', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001a', 'Project Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001b', 'Operations Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001c', 'Supply Chain Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001d', 'Inventory Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001e', 'Process Improvement', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000001f', 'Lean Six Sigma', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000020', 'Change Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000021', 'Risk Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000022', 'Business Analysis', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000023', 'Data-Driven Decision Making', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000024', 'KPI Tracking', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000025', 'Revenue Operations', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000026', 'Customer Success', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000027', 'Client Relations', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000028', 'Presentation Skills', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-000000000029', 'Public Speaking', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002a', 'Executive Communication', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002b', 'Proposal Writing', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002c', 'Cross-functional Leadership', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

INSERT INTO public.skills (id, name, category, weight)
VALUES ('50000000-0000-4000-a000-00000000002d', 'Team Management', 'business_sales', 1.0000)
ON CONFLICT (id) DO UPDATE
    SET name       = EXCLUDED.name,
        category   = EXCLUDED.category,
        weight     = EXCLUDED.weight,
        updated_at = now();

