"use client";

import { useMemo, useState } from "react";

const properties = [
  { id: 1, title: "شقة مميزة بالقرب من البوابة الأولى", area: "البوابة الأولى", type: "شقة", deal: "للبيع", price: "2,450,000", size: 150, rooms: 3, baths: 2, tag: "مميزة", tone: "sand" },
  { id: 2, title: "شقة واسعة بتشطيب سوبر لوكس", area: "البوابة الثانية", type: "شقة", deal: "للإيجار", price: "12,000", size:  formSize(180), rooms: 3, baths: 2, tag: "متاحة الآن", tone: "blue" },
  { id: 3, title: "دوبلكس بحديقة خاصة", area: "البوابة الرابعة", type: "دوبلكس", deal: "للبيع", price: "4,800,000", size: 230, rooms: 4, baths: 3, tag: "فرصة", tone: "green" },
  { id: 4, title: "شقة عائلية بإطلالة مفتوحة", area: "البوابة الثالثة", type: "شقة", deal: "للبيع", price: "1,950,000", size: 135, rooms: 3, baths: 1, tag: "جديد", tone: "rose" },
  { id: 5, title: "محل تجاري بموقع حيوي", area: "البوابة الأولى", type: "تجاري", deal: "للإيجار", price: "18,000", size: 75, rooms: 0, baths: 1, tag: "موقع مميز", tone: "blue" },
  { id: 6, title: "روف بتراس كبير", area: "البوابة الخامسة", type: "روف", deal: "للبيع", price: "3,150,000", size: 200, rooms: 3, baths: 2, tag: "مميز", tone: "sand" },
];

function formSize(value) { return value; }

export default function Home() {
  const [query, setQuery] = useState("");
  const [deal, setDeal] = useState("الكل");
  const [type, setType] = useState("الكل");
  const filtered = useMemo(() => properties.filter((p) =>
    (deal === "الكل" || p.deal === deal) &&
    (type === "الكل" || p.type === type) &&
    (p.title + p.area + p.type).includes(query.trim())
  ), [query, deal, type]);

  return (
    <main>
      <div className="topbar"><div className="container topbar-inner"><span>دليلك العقاري في حدائق الأهرام</span><span>منطقتك… فرصتك الأقرب</span></div></div>
      <header className="container header">
        <a className="brand" href="#"><span className="brand-mark">هـ</span><span><strong>حدائق الأهرام</strong><small>العقارات أقرب مما تتخيل</small></span></a>
        <nav><a href="#properties">العقارات</a><a href="#about">عن المنصة</a><a href="#contact">تواصل معنا</a></nav>
        <a className="add-btn" href="#contact">أضف عقارك <span>＋</span></a>
      </header>

      <section className="hero">
        <div className="hero-shape shape-one" /><div className="hero-shape shape-two" />
        <div className="container hero-content">
          <div className="eyebrow"><span /> منصتك العقارية المحلية</div>
          <h1>بيتك القادم<br /><em>في حدائق الأهرام</em></h1>
          <p>اكتشف شققاً وعقارات للبيع والإيجار في منطقتك،<br className="desktop-break" /> وقارن الخيارات واختر الأنسب لك بسهولة.</p>
          <a className="hero-link" href="#properties">اكتشف العقارات <span>←</span></a>
          <div className="hero-note"><span className="note-icon">⌂</span><span>كل ما تبحث عنه<br /><b>في مكان واحد</b></span></div>
        </div>
        <div className="hero-stats container"><div><b>حدائق الأهرام</b><span>منطقتنا… مجتمعنا</span></div><div><b>بيع وإيجار</b><span>خيارات تناسب احتياجك</span></div><div><b>بحث أسهل</b><span>ابدأ من هنا</span></div></div>
      </section>

      <section className="container search-wrap" aria-label="البحث عن عقار">
        <div className="search-heading"><div><span className="section-kicker">ابدأ رحلتك</span><h2>ابحث عن عقارك</h2></div><span className="search-symbol">⌕</span></div>
        <div className="filters">
          <label className="search-field"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالمنطقة أو وصف العقار..." /></label>
          <label><small>نوع العملية</small><select value={deal} onChange={e => setDeal(e.target.value)}><option>الكل</option><option>للبيع</option><option>للإيجار</option></select></label>
          <label><small>نوع العقار</small><select value={type} onChange={e => setType(e.target.value)}><option>الكل</option><option>شقة</option><option>دوبلكس</option><option>تجاري</option><option>روف</option></select></label>
          <a className="search-btn" href="#properties">اعرض النتائج <span>←</span></a>
        </div>
      </section>

      <section className="container listings" id="properties">
        <div className="section-head"><div><span className="section-kicker">اختيارات من المنطقة</span><h2>عقارات تستحق تشوفها</h2><p>تصفح مجموعة من نماذج العقارات المتاحة.</p></div><span className="results-count">{filtered.length} عقارات</span></div>
        <div className="property-grid">
          {filtered.map((p, i) => <article className="property-card" key={p.id}>
            <div className={"property-art " + p.tone}><span className="art-tag">{p.tag}</span><span className="building-icon">⌂</span><span className="art-number">0{i + 1}</span></div>
            <div className="property-info"><div className="property-meta"><span>{p.area}</span><span>{p.deal}</span></div><h3>{p.title}</h3><div className="features"><span>▧ {p.size} م²</span>{p.rooms > 0 && <span>▣ {p.rooms} غرف</span>}<span>◫ {p.baths} حمام</span></div><div className="card-bottom"><div><small>{p.deal === "للبيع" ? "السعر المطلوب" : "الإيجار الشهري"}</small><strong>{p.price} <small>ج.م</small></strong></div><a href="#contact" aria-label={"استفسر عن " + p.title}>←</a></div></div>
          </article>)}
        </div>
        {filtered.length === 0 && <div className="empty">مفيش نتائج مطابقة لبحثك. جرّب تغيير كلمات البحث أو الفلاتر.</div>}
        <p className="sample-note">ملحوظة: العقارات والأسعار المعروضة حالياً بيانات تجريبية لتوضيح شكل المنصة، وليست إعلانات حقيقية.</p>
      </section>

      <section className="about" id="about"><div className="container about-inner"><div><span className="section-kicker">عن حدائق الأهرام</span><h2>منطقتك تستحق<br /><em>منصة تجمعها</em></h2></div><p>منصة عقارية مخصصة لحدائق الأهرام، هدفها تسهيل الوصول إلى العقارات ومساعدة السكان والباحثين عن سكن على اكتشاف الخيارات في نفس المنطقة.</p><a href="#contact">خلّينا نتواصل <span>←</span></a></div></section>
      <footer id="contact"><div className="container footer-inner"><a className="brand footer-brand" href="#"><span className="brand-mark">هـ</span><span><strong>حدائق الأهرام</strong><small>العقارات أقرب مما تتخيل</small></span></a><div><strong>هل تريد إضافة عقارك؟</strong><p>قريباً يمكنك نشر إعلانك والتواصل مع المهتمين.</p></div><a className="footer-contact" href="mailto:hello@hadayek-al-ahram.example">تواصل معنا عبر البريد</a></div><div className="container copyright">© {new Date().getFullYear()} حدائق الأهرام — جميع الحقوق محفوظة</div></footer>
    </main>
  );
}
