import "./globals.css";

export const metadata = {
  title: "حدائق الأهرام | دليلك العقاري",
  description: "اكتشف شققاً وعقارات للبيع والإيجار في حدائق الأهرام.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
