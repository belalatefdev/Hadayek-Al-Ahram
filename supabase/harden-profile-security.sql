-- Security hardening: users must not be able to reactivate themselves or change account role/email.
-- Run this once in the Supabase SQL Editor for the production project.
revoke update on table public.profiles from authenticated;

-- The admin dashboard only updates this field to activate/deactivate accounts.
grant update (is_active) on table public.profiles to authenticated;

drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admin can manage profile activation" on public.profiles;

create policy "Admin can manage profile activation"
on public.profiles for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bilalatef88@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bilalatef88@gmail.com');
