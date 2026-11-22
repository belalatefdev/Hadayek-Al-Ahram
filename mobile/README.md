# تطبيق حدائق الأهرام — Expo

بنية تطبيق Native مستقلة (ليست WebView) تستخدم قاعدة Supabase نفسها للموقع.

## تشغيل محلي
1. تثبيت Node.js LTS.
2. من داخل مجلد `mobile`: `npm install`
3. نسخ `.env.example` إلى `.env` وإضافة Supabase URL وPublishable/Anon key.
4. `npm start` ثم فتح Expo Go أو محاكي Android.

## المراحل
- أساس Expo Router والهوية العربية RTL.
- توصيل Supabase auth وقائمة الإعلانات.
- استكمال تفاصيل العقار، إضافة الصور والبيانات، المفضلة المتزامنة، إشعارات، الدعم، الإدارة.
- اختبار Android وiOS قبل إصدار النسخ.

لا تضع Supabase service-role key داخل التطبيق؛ استخدم المفتاح العام فقط مع RLS.
