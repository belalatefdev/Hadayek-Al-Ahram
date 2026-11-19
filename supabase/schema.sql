-- حدائق الأهرام: الجداول وسياسات الأمان الأساسية
create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  deal_type text not null check (deal_type in ('بيع','إيجار')),
  property_type text not null,
  gate text,
  price numeric not null check (price >= 0),
  area numeric,
  bedrooms integer,
  bathrooms integer,
  description text,
  contact_name text,
  phone text,
  image_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_email text
);

alter table public.listings enable row level security;

drop policy if exists "Public can read published listings" on public.listings;
create policy "Public can read published listings"
on public.listings for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Admin can manage all listings" on public.listings;
create policy "Admin can manage all listings"
on public.listings for all
to authenticated
using ((auth.jwt() ->> 'email') = 'bilalatef88@gmail.com')
with check ((auth.jwt() ->> 'email') = 'bilalatef88@gmail.com');

-- السماح للزوار بإرسال إعلان جديد للمراجعة فقط؛ لا يمكنهم نشره مباشرة
drop policy if exists "Public can submit pending listings" on public.listings;
create policy "Public can submit pending listings"
on public.listings for insert
to anon, authenticated
with check (
  status = 'pending'
  and length(trim(coalesce(contact_name, ''))) > 0
  and length(trim(coalesce(phone, ''))) > 0
);
