-- Structured details for real estate listings
alter table public.listings
  add column if not exists floor text,
  add column if not exists finishing text,
  add column if not exists building_age text,
  add column if not exists address_details text;
