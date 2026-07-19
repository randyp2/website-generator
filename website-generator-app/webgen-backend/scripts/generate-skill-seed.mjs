/**
 * Generates an immutable Flyway migration from the human-edited skill catalog.
 *
 * Workflow:
 *   1. Edit seed/skills.v1.json and increment its version.
 *   2. Run `node scripts/generate-skill-seed.mjs --check`.
 *   3. Run `node scripts/generate-skill-seed.mjs` to write the next migration.
 *
 * Existing migrations and the catalog JSON are never rewritten.
 */
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = join(ROOT, "seed", "skills.v1.json");
const MIGRATION_DIRECTORY = join(ROOT, "src", "main", "resources", "db", "migration");
const BASELINE_CATALOG_VERSION = "1.0";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validates and flattens the JSON catalog into migration-ready skill contracts. */
export function normalizeCatalog(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Skill catalog must be a JSON object");
  }
  const version = requiredText(input.version, "version");
  if (!input.categories || typeof input.categories !== "object") {
    throw new Error("Skill catalog categories must be an object");
  }

  const terms = new Map();
  const skills = [];
  for (const [category, entries] of Object.entries(input.categories)) {
    requiredText(category, "category");
    if (!Array.isArray(entries)) {
      throw new Error(`Category ${category} must contain an array`);
    }
    for (const entry of entries) {
      const name = requiredText(entry?.name, `${category} skill name`);
      const id = optionalUuid(entry?.id, `${name} id`);
      const weight = validateWeight(entry?.weight, name);
      registerUniqueTerm(terms, name, `canonical skill ${name}`);
      const aliases = normalizeAliases(entry?.aliases, name, terms);
      skills.push({ id, name, category, weight, aliases });
    }
  }
  if (skills.length === 0) {
    throw new Error("Skill catalog must contain at least one skill");
  }
  return { version, skills };
}

/** Returns the next Flyway version from a list of migration filenames. */
export function nextMigrationVersion(filenames) {
  const versions = filenames
    .map((filename) => /^V(\d+)__/.exec(filename)?.[1])
    .filter(Boolean)
    .map(Number);
  return (versions.length === 0 ? 0 : Math.max(...versions)) + 1;
}

/** Extracts catalog versions already represented by immutable migrations. */
export function appliedCatalogVersions(migrationContents) {
  const versions = new Set([BASELINE_CATALOG_VERSION]);
  migrationContents.forEach((content) => {
    const match = /^-- Catalog-Version:\s*(\S+)\s*$/m.exec(content);
    if (match) {
      versions.add(match[1]);
    }
  });
  return versions;
}

/** Renders an idempotent catalog sync plus unresolved-claim backfill. */
export function renderMigration(catalog, migrationVersion) {
  const lines = [
    `-- Flyway V${migrationVersion}: Sync canonical skill catalog.`,
    `-- Catalog-Version: ${catalog.version}`,
    "-- Source: seed/skills.v1.json",
    "-- Existing canonical IDs are preserved and unresolved claims are backfilled.",
    "",
  ];

  catalog.skills.forEach((skill) => {
    lines.push(renderSkill(skill), "");
  });
  catalog.skills.forEach((skill) => {
    skill.aliases.forEach((alias) => lines.push(renderAlias(skill.name, alias), ""));
  });
  lines.push(
    "UPDATE public.claims AS claim",
    "SET canonical_skill_id = skill.id,",
    "    updated_at = now()",
    "FROM public.skills AS skill",
    "WHERE claim.canonical_skill_id IS NULL",
    "  AND lower(btrim(claim.raw_value)) = lower(skill.name);",
    "",
    "UPDATE public.claims AS claim",
    "SET canonical_skill_id = alias.skill_id,",
    "    updated_at = now()",
    "FROM public.skill_aliases AS alias",
    "WHERE claim.canonical_skill_id IS NULL",
    "  AND lower(btrim(claim.raw_value)) = lower(alias.alias);",
    "",
  );
  return lines.join("\n");
}

function normalizeAliases(input, skillName, terms) {
  if (input == null) {
    return [];
  }
  if (!Array.isArray(input)) {
    throw new Error(`Aliases for ${skillName} must be an array`);
  }
  return input.map((entry) => {
    const alias = requiredText(
      typeof entry === "string" ? entry : entry?.alias,
      `${skillName} alias`,
    );
    registerUniqueTerm(terms, alias, `alias for ${skillName}`);
    return alias;
  });
}

function registerUniqueTerm(terms, value, owner) {
  const normalized = value.toLocaleLowerCase("en-US");
  const existingOwner = terms.get(normalized);
  if (existingOwner) {
    throw new Error(`Duplicate skill term "${value}" between ${existingOwner} and ${owner}`);
  }
  terms.set(normalized, owner);
}

function requiredText(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-blank string`);
  }
  return value.trim();
}

function optionalUuid(value, field) {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`${field} must be a valid UUID when provided`);
  }
  return value.toLowerCase();
}

function validateWeight(value, skillName) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`Weight for ${skillName} must be a non-negative number`);
  }
  return value;
}

function renderSkill(skill) {
  const name = escapeSql(skill.name);
  const category = escapeSql(skill.category);
  const weight = skill.weight.toFixed(4);
  if (skill.id) {
    return [
      "INSERT INTO public.skills (id, name, category, weight)",
      `VALUES ('${skill.id}', '${name}', '${category}', ${weight})`,
      "ON CONFLICT (id) DO UPDATE",
      "SET name = EXCLUDED.name,",
      "    category = EXCLUDED.category,",
      "    weight = EXCLUDED.weight,",
      "    updated_at = now();",
    ].join("\n");
  }
  return [
    "INSERT INTO public.skills (name, category, weight)",
    `VALUES ('${name}', '${category}', ${weight})`,
    "ON CONFLICT (lower(name)) DO UPDATE",
    "SET category = EXCLUDED.category,",
    "    weight = EXCLUDED.weight,",
    "    updated_at = now();",
  ].join("\n");
}

function renderAlias(skillName, alias) {
  return [
    "INSERT INTO public.skill_aliases (skill_id, alias)",
    `SELECT skill.id, '${escapeSql(alias)}'`,
    "FROM public.skills AS skill",
    `WHERE lower(skill.name) = lower('${escapeSql(skillName)}')`,
    "ON CONFLICT (lower(alias)) DO NOTHING;",
  ].join("\n");
}

function escapeSql(value) {
  return value.replaceAll("'", "''");
}

function migrationFiles() {
  return readdirSync(MIGRATION_DIRECTORY).filter((filename) => /^V\d+__.*\.sql$/.test(filename));
}

function run() {
  const catalog = normalizeCatalog(JSON.parse(readFileSync(CATALOG_PATH, "utf8")));
  const filenames = migrationFiles();
  const appliedVersions = appliedCatalogVersions(
    filenames.map((filename) => readFileSync(join(MIGRATION_DIRECTORY, filename), "utf8")),
  );
  if (appliedVersions.has(catalog.version)) {
    console.log(`Skill catalog ${catalog.version} is already represented by a migration.`);
    return;
  }

  const migrationVersion = nextMigrationVersion(filenames);
  const versionSlug = catalog.version.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const output = join(
    MIGRATION_DIRECTORY,
    `V${migrationVersion}__sync_skill_catalog_${versionSlug}.sql`,
  );
  const sql = renderMigration(catalog, migrationVersion);
  console.log(
    `Validated catalog ${catalog.version}: ${catalog.skills.length} skills, `
      + `${catalog.skills.reduce((sum, skill) => sum + skill.aliases.length, 0)} aliases.`,
  );
  if (process.argv.includes("--check") || process.argv.includes("--dry-run")) {
    console.log(`Dry run would write ${output}`);
    return;
  }
  if (existsSync(output)) {
    throw new Error(`Refusing to overwrite existing migration: ${output}`);
  }
  writeFileSync(output, sql, { flag: "wx" });
  console.log(`Wrote ${output}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
