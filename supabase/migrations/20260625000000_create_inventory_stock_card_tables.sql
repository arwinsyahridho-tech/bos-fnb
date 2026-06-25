create table if not exists public.inventory_stock_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  category text not null default 'Bahan Baku',
  supplier text not null default '',
  purchase_qty numeric(18,4) not null default 0,
  purchase_unit text not null default 'Kg',
  purchase_price numeric(18,4) not null default 0,
  conversion_qty numeric(18,4) not null default 0,
  waste numeric(18,4) not null default 0,
  unit text not null default 'unit',
  unit_price numeric(18,4) not null default 0,
  current_stock numeric(18,4) not null default 0,
  minimum_stock numeric(18,4) not null default 0,
  raw_material_id text,
  raw_material_code text,
  source text not null default 'inventory',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.inventory_stock_movements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  reference text not null,
  item_id text not null references public.inventory_stock_items(id) on delete restrict,
  item_name text not null,
  type text not null check (type in ('stock_in','stock_out','adjustment','waste','opname')),
  quantity numeric(18,4) not null default 0,
  delta numeric(18,4) not null default 0,
  balance numeric(18,4) not null default 0,
  unit text not null default 'unit',
  unit_price numeric(18,4) not null default 0,
  notes text not null default '',
  reason text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, reference)
);

create index if not exists inventory_stock_items_user_idx on public.inventory_stock_items(user_id);
create index if not exists inventory_stock_movements_user_date_idx on public.inventory_stock_movements(user_id, date desc, created_at desc);
create index if not exists inventory_stock_movements_user_item_idx on public.inventory_stock_movements(user_id, item_id);

alter table public.inventory_stock_items enable row level security;
alter table public.inventory_stock_movements enable row level security;
alter table public.inventory_stock_items force row level security;
alter table public.inventory_stock_movements force row level security;

drop policy if exists "Inventory stock items owner access" on public.inventory_stock_items;
create policy "Inventory stock items owner access" on public.inventory_stock_items
  for all to authenticated
  using (user_id = auth.uid() and public.biya_inventory_access_allowed())
  with check (user_id = auth.uid() and public.biya_inventory_access_allowed());

drop policy if exists "Inventory stock movements owner access" on public.inventory_stock_movements;
create policy "Inventory stock movements owner access" on public.inventory_stock_movements
  for all to authenticated
  using (user_id = auth.uid() and public.biya_inventory_access_allowed())
  with check (user_id = auth.uid() and public.biya_inventory_access_allowed());

revoke all on public.inventory_stock_items from anon;
revoke all on public.inventory_stock_movements from anon;
grant select, insert, update, delete on public.inventory_stock_items to authenticated;
grant select, insert, update, delete on public.inventory_stock_movements to authenticated;
