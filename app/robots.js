export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/account", "/my-listings"] },
    ],
    sitemap: "https://hadayek-al-ahram.vercel.app/sitemap.xml",
  };
}
