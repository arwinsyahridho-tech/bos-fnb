const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const migration = fs.readFileSync(
  "supabase/migrations/20260614010000_create_account_center_profiles.sql",
  "utf8"
);

test("migration membuat tabel profile dengan kolom yang dibutuhkan frontend", () => {
  assert.match(migration, /create table if not exists public\.account_profiles/i);
  assert.match(migration, /create table if not exists public\.business_profiles/i);

  for (const column of [
    "full_name", "role", "plan_name", "subscription_start", "subscription_end",
    "business_name", "business_type", "owner_name", "province", "description"
  ]) {
    assert.match(migration, new RegExp(`\\b${column}\\b`, "i"));
  }

  assert.equal((migration.match(/user_id uuid not null unique references auth\.users\(id\) on delete cascade/gi) || []).length, 2);
});

test("migration mengaktifkan RLS dan ownership policy untuk kedua tabel", () => {
  for (const table of ["account_profiles", "business_profiles"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }

  assert.equal((migration.match(/for select to authenticated/gi) || []).length, 2);
  assert.equal((migration.match(/for insert to authenticated/gi) || []).length, 2);
  assert.equal((migration.match(/for update to authenticated/gi) || []).length, 2);
  assert.equal((migration.match(/auth\.uid\(\) = user_id/gi) || []).length, 8);
});

test("migration memberi authenticated hak schema dan operasi profile", () => {
  assert.match(migration, /grant usage on schema public to authenticated/i);
  assert.match(migration, /grant select, insert, update on public\.account_profiles to authenticated/i);
  assert.match(migration, /grant select, insert, update on public\.business_profiles to authenticated/i);
});
