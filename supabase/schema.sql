create extension if not exists "uuid-ossp";

-- Organizações
create table if not exists public.app_orgs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_user_id uuid not null references auth.users(id),
  slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.app_orgs enable row level security;

-- Membros da organização
create table if not exists public.app_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff', 'client')),
  status text not null default 'active',
  full_name text,
  email text,
  invited_email text,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

alter table public.app_members enable row level security;

-- Clientes
create table if not exists public.app_clients (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  name text not null,
  status text not null default 'new',
  plan text,
  main_channel text,
  account_manager text,
  payment_status text,
  payment_method text,
  billing_day int,
  start_date date,
  next_delivery date,
  last_meeting_at date,
  monthly_ticket numeric,
  progress int not null default 0 check (progress between 0 and 100),
  internal_notes text,
  invited_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.app_clients enable row level security;

-- Relação cliente x usuários convidados
create table if not exists public.app_client_users (
  client_id uuid not null references public.app_clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

alter table public.app_client_users enable row level security;

-- Tarefas
create table if not exists public.app_tasks (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  client_id uuid not null references public.app_clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  urgency text,
  due_date date,
  created_by uuid not null references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.app_tasks enable row level security;

-- Agenda/Calendário
create table if not exists public.app_content_calendar (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  client_id uuid references public.app_clients(id) on delete set null,
  title text not null,
  notes text,
  channel text not null,
  status text default 'planned',
  event_date timestamptz not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.app_content_calendar enable row level security;

-- Pastas de mídia
create table if not exists public.app_media_folders (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  client_id uuid references public.app_clients(id) on delete cascade,
  parent_folder uuid references public.app_media_folders(id) on delete cascade,
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.app_media_folders enable row level security;

-- Itens de mídia
create table if not exists public.app_media_items (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  client_id uuid references public.app_clients(id) on delete cascade,
  folder uuid references public.app_media_folders(id) on delete set null,
  title text,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.app_media_items enable row level security;

-- Convites
create table if not exists public.app_invitations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.app_orgs(id) on delete cascade,
  client_id uuid references public.app_clients(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('staff', 'client')),
  token text not null unique,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.app_invitations enable row level security;

-- Policies -------------------------------------------------------------

-- app_orgs policies
create policy if not exists owner_read_org
  on public.app_orgs
  for select using (auth.uid() = owner_user_id);

create policy if not exists owner_update_org
  on public.app_orgs
  for update using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create policy if not exists service_role_org
  on public.app_orgs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_members policies
create policy if not exists member_read_org_members
  on public.app_members
  for select using (
    exists (
      select 1
      from public.app_members m
      where m.org_id = app_members.org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy if not exists owner_manage_members_insert
  on public.app_members
  for insert with check (
    exists (
      select 1
      from public.app_orgs o
      where o.id = org_id
        and o.owner_user_id = auth.uid()
    )
  );

create policy if not exists owner_manage_members_update
  on public.app_members
  for update using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = org_id
        and o.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.app_orgs o
      where o.id = org_id
        and o.owner_user_id = auth.uid()
    )
  );

create policy if not exists owner_manage_members_delete
  on public.app_members
  for delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = org_id
        and o.owner_user_id = auth.uid()
    )
  );

create policy if not exists service_role_members
  on public.app_members
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_clients policies
create policy if not exists org_members_read_clients
  on public.app_clients
  for select using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_clients.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_clients.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
    )
    or exists (
      select 1
      from public.app_client_users cu
      where cu.client_id = app_clients.id
        and cu.user_id = auth.uid()
    )
  );

create policy if not exists org_staff_insert_clients
  on public.app_clients
  for insert with check (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_clients.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_clients.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  );

create policy if not exists org_staff_update_clients
  on public.app_clients
  for update using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_clients.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_clients.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists org_staff_delete_clients
  on public.app_clients
  for delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_clients.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_clients.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  );

create policy if not exists service_role_clients
  on public.app_clients
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_client_users policies
create policy if not exists client_users_select
  on public.app_client_users
  for select using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.app_orgs o
      join public.app_clients c on c.org_id = o.id and c.id = client_id
      where o.owner_user_id = auth.uid()
    )
    or exists (
      select 1
      from public.app_members m
      join public.app_clients c on c.org_id = m.org_id and c.id = client_id
      where m.user_id = auth.uid()
        and m.status = 'active'
        and m.role in ('owner', 'staff')
    )
  );

create policy if not exists service_role_client_users
  on public.app_client_users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_tasks policies
create policy if not exists org_members_read_tasks
  on public.app_tasks
  for select using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_tasks.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_tasks.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
    )
    or exists (
      select 1
      from public.app_client_users cu
      where cu.client_id = app_tasks.client_id
        and cu.user_id = auth.uid()
    )
  );

create policy if not exists org_staff_manage_tasks
  on public.app_tasks
  for insert with check (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_tasks.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_tasks.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  );

create policy if not exists org_staff_update_tasks
  on public.app_tasks
  for update using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_tasks.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_tasks.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists org_staff_delete_tasks
  on public.app_tasks
  for delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_tasks.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_tasks.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  );

create policy if not exists service_role_tasks
  on public.app_tasks
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_content_calendar policies
create policy if not exists org_members_read_calendar
  on public.app_content_calendar
  for select using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_content_calendar.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_content_calendar.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
    )
  );

create policy if not exists org_staff_manage_calendar
  on public.app_content_calendar
  for insert, update, delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_content_calendar.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_content_calendar.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists client_read_calendar
  on public.app_content_calendar
  for select using (
    exists (
      select 1
      from public.app_client_users cu
      where cu.client_id = app_content_calendar.client_id
        and cu.user_id = auth.uid()
    )
  );

create policy if not exists service_role_calendar
  on public.app_content_calendar
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_media_folders policies
create policy if not exists org_members_read_media_folders
  on public.app_media_folders
  for select using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_media_folders.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_media_folders.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
    )
    or exists (
      select 1
      from public.app_client_users cu
      where cu.client_id = app_media_folders.client_id
        and cu.user_id = auth.uid()
    )
  );

create policy if not exists org_staff_manage_media_folders
  on public.app_media_folders
  for insert, update, delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_media_folders.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_media_folders.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists service_role_media_folders
  on public.app_media_folders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_media_items policies
create policy if not exists org_members_read_media_items
  on public.app_media_items
  for select using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_media_items.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_media_items.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
          )
        )
    )
    or exists (
      select 1
      from public.app_client_users cu
      where cu.client_id = app_media_items.client_id
        and cu.user_id = auth.uid()
    )
  );

create policy if not exists org_staff_manage_media_items
  on public.app_media_items
  for insert, update, delete using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = app_media_items.org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = app_media_items.org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists service_role_media_items
  on public.app_media_items
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- app_invitations policies
create policy if not exists org_staff_manage_invitations
  on public.app_invitations
  for insert using (
    exists (
      select 1
      from public.app_orgs o
      where o.id = org_id
        and (
          o.owner_user_id = auth.uid()
          or exists (
            select 1
            from public.app_members m
            where m.org_id = org_id
              and m.user_id = auth.uid()
              and m.status = 'active'
              and m.role in ('owner', 'staff')
          )
        )
    )
  )
  with check (true);

create policy if not exists org_members_read_invitations
  on public.app_invitations
  for select using (
    exists (
      select 1
      from public.app_members m
      where m.org_id = org_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy if not exists service_role_invitations
  on public.app_invitations
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
