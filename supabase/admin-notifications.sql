-- إشعارات لوحة الإدارة: حساب جديد أو إعلان جديد للمراجعة
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_account','new_listing')),
  title text not null,
  message text not null,
  related_id text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications enable row level security;

drop policy if exists "Admin can read notifications" on public.admin_notifications;
create policy "Admin can read notifications"
on public.admin_notifications for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'bilalatef88@gmail.com');

drop policy if exists "Admin can update notifications" on public.admin_notifications;
create policy "Admin can update notifications"
on public.admin_notifications for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email','')) = 'bilalatef88@gmail.com')
with check (lower(coalesce(auth.jwt() ->> 'email','')) = 'bilalatef88@gmail.com');

grant select, update on public.admin_notifications to authenticated;

create or replace function public.notify_admin_new_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications(type,title,message,related_id)
  values (
    'new_account',
    'تسجيل حساب جديد',
    'تم تسجيل ' || coalesce(new.raw_user_meta_data ->> 'full_name','مستخدم جديد') ||
      ' كـ ' || coalesce(new.raw_user_meta_data ->> 'account_type','مالك'),
    new.id::text
  );
  return new;
end;
$$;

drop trigger if exists notify_admin_after_account_signup on auth.users;
create trigger notify_admin_after_account_signup
after insert on auth.users
for each row execute function public.notify_admin_new_account();

create or replace function public.notify_admin_new_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications(type,title,message,related_id)
  values (
    'new_listing',
    'إعلان جديد للمراجعة',
    'تم استلام إعلان: ' || coalesce(new.title,new.property_type,'عقار جديد') ||
      ' · ' || coalesce(new.gate,'حدائق الأهرام'),
    new.id::text
  );
  return new;
end;
$$;

drop trigger if exists notify_admin_after_listing_insert on public.listings;
create trigger notify_admin_after_listing_insert
after insert on public.listings
for each row execute function public.notify_admin_new_listing();
