-- Inventory private development gate. Frontend visibility is not a security boundary:
-- every current public.inventory / public.inventory_* table is protected here by RLS.
begin;

create or replace function public.biya_inventory_access_allowed()
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog
as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'arwinsyahridho@gmail.com', false)
$$;

revoke all on function public.biya_inventory_access_allowed() from public;
grant execute on function public.biya_inventory_access_allowed() to authenticated;

DO $migration$
DECLARE
  inventory_table record;
  old_policy record;
BEGIN
  FOR inventory_table IN
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type = 'BASE TABLE'
       AND (table_name = 'inventory' OR table_name LIKE 'inventory\_%' ESCAPE '\')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', inventory_table.table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', inventory_table.table_name);

    -- Permissive policies combine with OR, so remove all previous policies to avoid bypass.
    FOR old_policy IN
      SELECT policyname FROM pg_policies
       WHERE schemaname = 'public' AND tablename = inventory_table.table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', old_policy.policyname, inventory_table.table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.biya_inventory_access_allowed()) WITH CHECK (public.biya_inventory_access_allowed())',
      'Inventory private developer access', inventory_table.table_name
    );
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', inventory_table.table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', inventory_table.table_name);
  END LOOP;
END
$migration$;

commit;
