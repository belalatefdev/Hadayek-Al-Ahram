-- Allow the platform administrator to view all registered owner and broker profiles
drop policy if exists "Admin can view all profiles" on public.profiles;
create policy "Admin can view all profiles"
on public.profiles for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'bilalatef88@gmail.com');
