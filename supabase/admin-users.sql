-- Admin-only account management access
alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, account_type, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'account_type' = 'وسيط عقاري' then 'وسيط عقاري' else 'مالك' end,
    new.email
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    account_type = excluded.account_type,
    email = excluded.email;
  return new;
end;
$$;

drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
on public.profiles for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bilalatef88@gmail.com');
