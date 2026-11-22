# تطبيق حدائق الأهرام — React Native / Expo

تطبيق Native مستقل للموقع، متصل بنفس مشروع Supabase.

## التجهيز المحلي
1. تثبيت Node.js LTS.
2. الدخول إلى مجلد `mobile`.
3. تنفيذ `npm install`.
4. نسخ `.env.example` إلى `.env` وإضافة Supabase URL وPublic anon/publishable key.
5. تشغيل `npx expo start` واختبار التطبيق عبر Expo Go أو محاكي.

## الميزات الحالية في الكود
- قائمة العقارات المنشورة من Supabase مع بحث وفلترة بالبوابة/النوع/بيع أو إيجار.
- شاشة تفاصيل العقار وبيانات السعر/المتر والتقسيط.
- مشاركة الإعلان والتواصل عبر WhatsApp.
- تسجيل الدخول وإنشاء حساب.
- لوحة حساب تعرض إعلانات المستخدم وحالة مراجعتها.
- نموذج تقديم إعلان، بيانات العقار، حساب السعر للمتر، ورفع حتى 6 صور إلى Storage bucket `listing-images`.
- المفضلة محفوظة محليًا على الجهاز.

## إعدادات الصور
- رفع الصور يتطلب مستخدمًا مسجلًا بسبب سياسات RLS الحالية.
- الصور تُرفع إلى `listing-images/listings/<user-id>/...` مع روابط عامة للعرض.
- لا تستخدم service-role key داخل التطبيق.

## بناء APK للاختبار
تثبيت/تسجيل الدخول إلى EAS:
```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
``
سيخرج EAS رابط ملف APK بعد نجاح البناء. لم يتم تأكيد نجاح build حتى الآن.

## بناء نسخة إنتاج Android
```bash
npx eas-cli build --platform android --profile production
``

## ملاحظات قبل الإصدار
- مراجعة Expo dependency compatibility وتشغيل TypeScript/Expo checks على جهاز أو بيئة build.
- اختبار الدخول، إنشاء حساب، رفع الصور، تقديم الإعلان، المفضلة، الدعم، وفتح روابط WhatsApp.
- إعداد إشعارات push والإدارة الكاملة قبل إطلاق رسمي.
- لا يتم تضمين أي مفتاح Supabase خاص أو service-role في التطبيق.
