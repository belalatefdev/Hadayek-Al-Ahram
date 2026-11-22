import "./globals.css";
import SupportChat from "./SupportChat";

export const metadata = {
  metadataBase: new URL("https://hadayek-al-ahram.vercel.app"),
  alternates: { canonical: "/" },
  title: {
    default: "حدائق الأهرام | منصتك العقارية",
    template: "%s | حدائق الأهرام",
  },
  description: "منصة عقارية متخصصة في حدائق الأهرام. اكتشف عقارات للبيع والإيجار، وأضف إعلانك وتابع طلباتك بسهولة.",
  applicationName: "منصة حدائق الأهرام العقارية",
  keywords: ["حدائق الأهرام","عقارات حدائق الأهرام","شقق للبيع","شقق للإيجار","عقارات"],
  openGraph: {
    title: "حدائق الأهرام | منصتك العقارية",
    description: "اكتشف أفضل فرص البيع والإيجار في حدائق الأهرام.",
    locale: "ar_EG",
    type: "website",
    siteName: "حدائق الأهرام",
    url: "https://hadayek-al-ahram.vercel.app",
  },
  twitter: { card: "summary_large_image", title: "حدائق الأهرام | منصتك العقارية", description: "اكتشف أفضل فرص البيع والإيجار في حدائق الأهرام." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}<SupportChat /></body>
    </html>
  );
}
