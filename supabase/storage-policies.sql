-- Allow visitors to upload listing photos into the public listing-images bucket.
-- The bucket itself should be configured as Public in Supabase Storage.
drop policy if exists "Visitors can upload listing images" on storage.objects;

create policy "Visitors can upload listing images"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = 'listings'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);
