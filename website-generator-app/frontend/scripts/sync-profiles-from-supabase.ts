import { spawnSync } from "node:child_process";
import { createClient, type User } from "@supabase/supabase-js";

const DEFAULT_LOCAL_PG_URL = "postgresql://portrn:portrn@localhost:5433/portrn_dev";
const DEFAULT_PAGE_SIZE = 200;
const DEFAULT_UPSERT_BATCH_SIZE = 500;

type SyncProfile = {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
};

const getFirstEnv = (...keys: string[]): string | null => {
    for (const key of keys) {
        const value = process.env[key]?.trim();
        if (value) return value;
    }
    return null;
};

const getRequiredEnv = (keys: string[]): string => {
    const value = getFirstEnv(...keys);
    if (!value) {
        throw new Error(`Missing required env var. Expected one of: ${keys.join(", ")}`);
    }
    return value;
};

const parsePositiveInt = (raw: string | undefined, fallback: number): number => {
    if (!raw) return fallback;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeOptionalString = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const toProfile = (user: User): SyncProfile => {
    const metadata =
        user.user_metadata && typeof user.user_metadata === "object"
            ? (user.user_metadata as Record<string, unknown>)
            : {};

    return {
        id: user.id,
        email: normalizeOptionalString(user.email),
        fullName: normalizeOptionalString(metadata.full_name ?? metadata.name),
        avatarUrl: normalizeOptionalString(metadata.avatar_url),
    };
};

const sqlLiteral = (value: string | null): string => {
    if (value === null) return "NULL";
    return `'${value.replace(/'/g, "''")}'`;
};

const buildUpsertSql = (rows: SyncProfile[]): string => {
    const valuesSql = rows
        .map(
            (row) =>
                `(${sqlLiteral(row.id)}::uuid, ${sqlLiteral(row.email)}, ${sqlLiteral(row.fullName)}, ${sqlLiteral(row.avatarUrl)})`,
        )
        .join(",\n");

    return `
BEGIN;
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES
${valuesSql}
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
COMMIT;
`;
};

const runPsql = (pgUrl: string, sql: string): void => {
    const result = spawnSync("psql", [pgUrl, "-v", "ON_ERROR_STOP=1", "-q"], {
        input: sql,
        encoding: "utf8",
    });

    if (result.error) {
        if ((result.error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new Error(
                "psql is not installed or not in PATH. Install PostgreSQL client tools or run with a containerized psql command.",
            );
        }
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `psql command failed (exit ${result.status}). ${result.stderr?.trim() || result.stdout?.trim() || "No output."}`,
        );
    }
};

const fetchAllUsers = async (pageSize: number): Promise<User[]> => {
    const supabaseUrl = getRequiredEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);
    const serviceRoleKey = getRequiredEnv([
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_SECRET_KEY",
    ]);

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const users: User[] = [];
    let page = 1;

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: pageSize,
        });

        if (error) {
            throw new Error(`Failed to list Supabase users (page ${page}): ${error.message}`);
        }

        const batch = data?.users ?? [];
        users.push(...batch);

        if (batch.length < pageSize) break;
        page += 1;
    }

    return users;
};

const chunk = <T>(items: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
};

const formatPreviewValue = (value: string | null): string =>
    value === null ? "NULL" : value;

const main = async (): Promise<void> => {
    const localPgUrl = process.env.LOCAL_PG_URL?.trim() || DEFAULT_LOCAL_PG_URL;
    const pageSize = parsePositiveInt(process.env.SYNC_PAGE_SIZE, DEFAULT_PAGE_SIZE);
    const upsertBatchSize = parsePositiveInt(
        process.env.UPSERT_BATCH_SIZE,
        DEFAULT_UPSERT_BATCH_SIZE,
    );
    const isDryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

    console.log("Starting profile sync...");
    console.log(`- Supabase listUsers page size: ${pageSize}`);
    console.log(`- Local Postgres URL: ${localPgUrl}`);
    console.log(`- Upsert batch size: ${upsertBatchSize}`);
    console.log(`- Dry run: ${isDryRun ? "yes" : "no"}`);

    const users = await fetchAllUsers(pageSize);
    const rows = users.map(toProfile);

    if (rows.length === 0) {
        console.log("No users found in Supabase auth. Nothing to sync.");
        return;
    }

    if (isDryRun) {
        console.log(`Dry run complete. Would sync ${rows.length} profile row(s).`);
        console.log("Preview rows:");
        for (const row of rows) {
            console.log(
                `- id=${row.id} | email=${formatPreviewValue(row.email)} | full_name=${formatPreviewValue(row.fullName)} | avatar_url=${formatPreviewValue(row.avatarUrl)}`,
            );
        }
        return;
    }

    const batches = chunk(rows, upsertBatchSize);
    let synced = 0;

    for (let index = 0; index < batches.length; index += 1) {
        const batch = batches[index];
        const sql = buildUpsertSql(batch);
        runPsql(localPgUrl, sql);
        synced += batch.length;
        console.log(`Synced batch ${index + 1}/${batches.length} (${synced}/${rows.length})`);
    }

    console.log(`Profile sync complete. Synced ${synced} profile row(s).`);
};

main().catch((error) => {
    console.error("Profile sync failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
