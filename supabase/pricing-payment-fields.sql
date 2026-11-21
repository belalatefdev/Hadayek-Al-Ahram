-- Migration: property pricing unit and payment method
alter table public.listings
  add column if not exists price_unit text not null default 'إجمالي العقار',
  add column if not exists payment_method text not null default 'كاش',
  add column if not exists down_payment numeric,
  add column if not exists installment_years integer,
  add column if not exists monthly_installment numeric;
