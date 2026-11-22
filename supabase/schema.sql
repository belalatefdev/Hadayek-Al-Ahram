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
  price_per_meter numeric,
  area numeric,
  bedrooms integer,
  bathrooms integer,
  description text,
  contact_name text,
  phone text,
  image_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_email text,
  price_unit text not null default 'إجمالي العقار',
  payment_method text not null default 'كاش',
  down_payment numeric,
  installment_years integer,
  monthly_installment numeric,
  floor text,
  finishing text,
  building_age text,
  address_details text
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
drop policy if exists "Users can submit own pending listings" on public.listings;
create policy "Users can submit own pending listings"
on public.listings for insert
to authenticated
with check (
  (select auth.uid()) = submitted_by
  and status = 'pending'
  and length(trim(coalesce(contact_name, ''))) > 0
  and length(trim(coalesce(phone, ''))) > 0
);
