import "./globals.css";

export const metadata = {
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
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}