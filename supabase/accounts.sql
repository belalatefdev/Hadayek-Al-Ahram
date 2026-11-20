-- نظام حسابات الملاك والوسطاء وربط الإعلانات بأصحابها
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  account_type text not null default 'مالك' check (account_type in ('مالك','وسيط عقاري')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'account_type' = 'وسيط عقاري' then 'وسيط عقاري' else 'مالك' end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    account_type = excluded.account_type;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- المالك أو الوسيط يرى إعلاناته فقط، ولا يستطيع اعتمادها أو نشرها بنفسه
drop policy if exists "Public can submit pending listings" on public.listings;
drop policy if exists "Users can submit own pending listings" on public.listings;
create policy "Users can submit own pending listings"
on public.listings for insert to authenticated
with check (
  auth.uid() = submitted_by
  and status = 'pending'
  and length(trim(coalesce(contact_name, ''))) > 0
  and length(trim(coalesce(phone, ''))) > 0
);

drop policy if exists "Users can read own listings" on public.listings;
create policy "Users can read own listings"
on public.listings for select to authenticated
using (auth.uid() = submitted_by);

-- سياسة المدير الحالية تظل كما هي وتسمح له بمراجعة وإدارة كل الإعلانات.
