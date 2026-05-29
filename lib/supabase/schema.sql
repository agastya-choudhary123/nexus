-- User profiles keyed to Auth.js session
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id text unique not null,
  email text not null,
  created_at timestamptz default now()
);

-- MCP servers the user has connected
create table if not exists mcp_registry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  server_name text not null,
  display_name text not null,
  transport text not null,
  endpoint text,
  scopes text[] not null default '{}',
  enabled boolean default false,
  connected_at timestamptz default now(),
  unique(user_id, server_name)
);

-- Actions proposed by the agent awaiting human approval
create table if not exists pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  inngest_run_id text not null,
  original_prompt text not null,
  proposed_action jsonb not null,
  verifier_verdict text,
  verifier_reasoning text,
  verifier_confidence float,
  status text default 'pending',
  ui_hint jsonb,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Full execution log for every agent session
create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles(id) on delete cascade,
  session_id text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Enable row level security
alter table user_profiles enable row level security;
alter table mcp_registry enable row level security;
alter table pending_actions enable row level security;
alter table agent_logs enable row level security;

-- Policies: users only see their own data
create policy "own profile" on user_profiles
  for all using (auth_id = auth.uid()::text);

create policy "own registry" on mcp_registry
  for all using (
    user_id = (
      select id from user_profiles where auth_id = auth.uid()::text
    )
  );

create policy "own actions" on pending_actions
  for all using (
    user_id = (
      select id from user_profiles where auth_id = auth.uid()::text
    )
  );

create policy "own logs" on agent_logs
  for all using (
    user_id = (
      select id from user_profiles where auth_id = auth.uid()::text
    )
  );
