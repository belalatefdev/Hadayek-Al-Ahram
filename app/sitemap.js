const BASE_URL = "https://hadayek-al-ahram.vercel.app";

export default async function sitemap() {
  const pages = [
    {
      url: BASE_URL + "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return pages;

  try {
    const endpoint = new URL("/rest/v1/listings", supabaseUrl);
    endpoint.searchParams.set("select", "id,created_at");
    endpoint.searchParams.set("status", "eq.published");
    endpoint.searchParams.set("order", "created_at.desc");
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return pages;

    const listings = await response.json();
    for (const listing of listings || []) {
      if (!listing?.id) continue;
      pages.push({
        url: `${BASE_URL}/listing/${listing.id}`,
        lastModified: listing.created_at ? new Date(listing.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Keep the homepage sitemap available if the listings query is unavailable.
  }

  return pages;
}
