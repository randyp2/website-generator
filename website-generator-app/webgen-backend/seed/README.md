# Skill catalog workflow

`skills.v1.json` is the human-edited source of truth for canonical skills and aliases.
The generator never rewrites the catalog or an existing Flyway migration.

## Add a skill

Add an object to the appropriate category and increment the top-level catalog version:

```json
{
  "name": "Amazon S3",
  "weight": 1,
  "aliases": ["S3", "AWS S3"]
}
```

Existing entries may retain their `id` fields. New entries and aliases do not require IDs.
Canonical names and aliases must be unique without regard to letter case.

Validate without writing:

```bash
node scripts/generate-skill-seed.mjs --check
```

Generate the next immutable migration:

```bash
node scripts/generate-skill-seed.mjs
```

The generated migration automatically uses the next available Flyway version, upserts
the complete catalog, and maps existing unresolved claims whose raw values match a new
canonical name or alias. Run a provider resync after applying it so evidence and claim
statuses are recalculated.
