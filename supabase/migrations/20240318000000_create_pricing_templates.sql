create table public.pricing_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  materials jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pricing_templates enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.pricing_templates
  for select using (true);

create policy "Enable insert for authenticated users only" on public.pricing_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.pricing_templates
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.pricing_templates
  for delete using (auth.role() = 'authenticated');

-- Create updated_at trigger
create trigger handle_updated_at before update on public.pricing_templates
  for each row execute procedure moddatetime('updated_at'); 