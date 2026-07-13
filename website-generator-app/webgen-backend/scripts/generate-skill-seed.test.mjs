import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  appliedCatalogVersions,
  nextMigrationVersion,
  normalizeCatalog,
  renderMigration,
} from "./generate-skill-seed.mjs";

const ROOT = join(import.meta.dirname, "..");

test("validates the tracked catalog as the source of truth", () => {
  const input = JSON.parse(readFileSync(join(ROOT, "seed", "skills.v1.json"), "utf8"));
  const catalog = normalizeCatalog(input);

  assert.equal(catalog.version, "1.0");
  assert.ok(catalog.skills.length > 100);
});

test("rejects case-insensitive collisions between names and aliases", () => {
  assert.throws(
    () => normalizeCatalog({
      version: "2.0",
      categories: {
        engineering: [
          { name: "Amazon S3", weight: 1, aliases: ["S3"] },
          { name: "s3", weight: 1, aliases: [] },
        ],
      },
    }),
    /Duplicate skill term/,
  );
});

test("renders idempotent inserts and unresolved claim backfill", () => {
  const catalog = normalizeCatalog({
    version: "2.0",
    categories: {
      engineering: [{ name: "Amazon S3", weight: 1, aliases: ["S3"] }],
    },
  });

  const migration = renderMigration(catalog, 41);

  assert.match(migration, /Catalog-Version: 2\.0/);
  assert.match(migration, /ON CONFLICT \(lower\(name\)\) DO UPDATE/);
  assert.match(migration, /ON CONFLICT \(lower\(alias\)\) DO NOTHING/);
  assert.match(migration, /UPDATE public\.claims AS claim/);
});

test("selects the next migration and recognizes applied catalog versions", () => {
  assert.equal(nextMigrationVersion(["V13__skills.sql", "V40__topics.sql"]), 41);
  assert.deepEqual(
    [...appliedCatalogVersions(["-- Catalog-Version: 1.1\nSELECT 1;"])].sort(),
    ["1.0", "1.1"],
  );
});
