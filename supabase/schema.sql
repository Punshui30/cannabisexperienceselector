-- Core merchant tables
CREATE TABLE IF NOT EXISTS stores (
    id uuid primary key,
    name text not null,
    created_at timestamptz default now()
);

-- Seed demo store
INSERT INTO stores (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Dispensary & Delivery') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS items (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    name text not null,
    kind text null, -- flower|vape|edible|pre-roll|concentrate|other
    thc numeric null,
    cbd numeric null,
    terpenes jsonb null,
    in_stock boolean default true,
    source text default 'manual', -- manual|dutchie|metrc|import
    sku text null,
    brand text null,
    external_ref jsonb null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS events (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    kind text null, -- blend|stack|match
    title text not null,
    payload jsonb not null,
    track_id text null,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS shares (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    kind text null, -- blend|stack|match
    payload jsonb not null,
    track_id text null,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS coa_files (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    item_id uuid references items(id) on delete set null,
    file_url text not null,
    lab text null,
    tested_at date null,
    raw jsonb null,
    created_at timestamptz default now()
);

-- User memory (demo-grade)
CREATE TABLE IF NOT EXISTS users (
    id uuid primary key,
    created_at timestamptz default now(),
    display_name text null,
    preferences jsonb null
);

CREATE TABLE IF NOT EXISTS user_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    store_id uuid references stores(id) on delete set null,
    kind text null,
    payload jsonb not null,
    track_id text null,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    ref_kind text null, -- share|item|blend|stack
    ref_id text not null,
    note text null,
    created_at timestamptz default now()
);

-- Integration foundations
CREATE TABLE IF NOT EXISTS integrations (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    provider text null, -- dutchie|metrc|other
    status text default 'disconnected', -- disconnected|connected|error
    config jsonb null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS external_entities (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid references stores(id) on delete cascade,
    provider text not null,
    entity_type text not null, -- product|item|batch|package|strain|coa
    external_id text not null,
    local_table text not null, -- items|coa_files|shares|etc
    local_id uuid not null,
    raw jsonb null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_store_time ON events(store_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_shares_store_time ON shares(store_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_items_store_stock ON items(store_id, in_stock);
CREATE INDEX IF NOT EXISTS idx_user_history_user_time ON user_history(user_id, created_at desc);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_external ON external_entities(store_id, provider, entity_type, external_id);
