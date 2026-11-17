"use client";

import { useMemo, useState } from "react";

const properties = [
  { id: 1, title: "شقة للإيجار – البوابة الأولى", area: "البوابة الأولى", type: "شقة", deal: "للإيجار", price: "18,000", size: 120, rooms: 2, baths: 1, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85", verified: true },
  { id: 2, title: "شقة للبيع – البوابة الثانية", area: "البوابة الثانية", type: "شقة", deal: "للبيع", price: "2,272,000", size: 142, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85", verified: true },
  { id: 3, title: "شقة للبيع – البوابة الرابعة", area: "البوابة الرابعة", type: "شقة", deal: "للبيع", price: "2,790,000", size: 155, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85", verified: true },
  { id: 4, title: "دوبلكس بحديقة خاصة", area: "البوابة الثالثة", type: "دوبلكس", deal: "للبيع", price: "4,800,000", size: 230, rooms: 4, baths: 3, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85", verified: false },
  { id: 5, title: "شقة عائلية بإطلالة مفتوحة", area: "البوابة الخامسة", type: "شقة", deal: "للإيجار", price: "14,000", size: 135, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=85", verified: true },
  { id: 6, title: "محل تجاري بموقع حيوي", area: "البوابة الأولى", type: "تجاري", deal: "للإيجار", price: "18,000", size: 75, rooms: 0, baths: 1, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85", verified: false },
];

const gates = ["كل البوابات", "البوابة الأولى", "البوابة الثانية", "البوابة الثالثة", "البوابة الرابعة", "البوابة الخامسة"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [deal, setDeal] = useState("الكل");
  const [type, setType] = useState("الكل");
  const [gate, setGate] = useState("كل البوابات");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => properties.filter((p) => {
    const numericPrice = Number(p.price.replace(/,/g, ""));
    return (deal === "الكل" || p.deal === deal) &&
      (type === "الكل" || p.type === type) &&
      (gate === "كل البوابات" || p.area === gate) &&
      (p.title + p.area + p.type).includes(query.trim()) &&
      (!minPrice || numericPrice >= Number(minPrice)) &&
      (!maxPrice || numericPrice <= Number(maxPrice));
  }), [query, deal, type, gate, minPrice, maxPrice]);

  return (
    <main>
      <div className="topbar"><div className="container topbar-inner"><span>📍 دليلك العقاري في حدائق الأهرام</span><span>عقارك في المكان الصح</span></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#"><span className="brand-symbol">⌂</span><span><strong>حدائق الأهرام</strong><small>عقاراتك في المكان الصح</small></span></a>
          <nav className="main-nav"><a className="active" href="#">الرئيسية</a><a href="#properties">للبيع</a><a href="#properties">للإيجار</a><a href="#prices">أسعار المتر</a><a href="#about">عن المنطقة</a></nav>
          <div className="account-links"><a href="#contact">تسجيل الدخول</a><a href="#contact">إنشاء حساب</a><a className="gold-btn" href="#contact">＋ أضف إعلان</a></div>
          <button className="mobile-menu" aria-label="القائمة">☰</button>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="container hero-copy">
          <div className="hero-brand"><span>حدائق الأهرام</span><small>عقاراتك في المكان الصح</small></div>
          <p className="hero-overline">كل ما تحتاجه عن العقارات في</p>
          <h1>حدائق الأهرام</h1>
          <p className="hero-subtitle">بيع – شراء – إيجار <i /> بكل سهولة وأمان</p>
        </div>
        <div className="container search-panel">
          <label><span>⌂ نوع العقار</span><select value={type} onChange={e => setType(e.target.value)}><option value="الكل">اختر النوع</option><option>شقة</option><option>دوبلكس</option><option>تجاري</option></select></label>
          <label><span>📍 الحدائق</span><select value={gate} onChange={e => setGate(e.target.value)}>{gates.map(g => <option key={g}>{g}</option>)}</select></label>
          <label><span>جنيه السعر من</span><input inputMode="numeric" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="أقل سعر" /></label>
          <label><span>جنيه السعر إلى</span><input inputMode="numeric" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="أعلى سعر" /></label>
          <label><span>المساحة من</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالمنطقة أو العقار" /></label>
          <a className="search-submit" href="#properties">بحث <b>⌕</b></a>
        </div>
      </section>

      <section className="benefits container">
        <div><b className="benefit-icon">＋</b><strong>إضافة إعلان مجاني</strong><span>في دقائق</span></div>
        <div><b className="benefit-icon">▥</b><strong>متابعة أسعار المتر</strong><span>بشكل دوري</span></div>
        <div><b className="benefit-icon">⌖</b><strong>خريطة تفاعلية</strong><span>للموقع</span></div>
        <div><b className="benefit-icon">☏</b><strong>دعم ومساعدة</strong><span>على مدار الساعة</span></div>
        <div><b className="benefit-icon">✓</b><strong>إعلانات موثوقة</strong><span>ومعتمدة</span></div>
      </section>

      <section className="container content-layout" id="properties">
        <div className="listings-area">
          <div className="section-title"><div><span>اختار عقارك</span><h2>أحدث الإعلانات</h2></div><a href="#properties">عرض الكل ←</a></div>
          <div className="property-grid">
            {filtered.map(p => <article className="property-card" key={p.id}>
              <div className="property-image"><img src={p.image} alt={p.title} /><span className={p.verified ? "verified" : "unverified"}>{p.verified ? "✓ تم التحقق" : "إعلان جديد"}</span><span className="photo-count">▣ {p.id === 1 ? 8 : p.id === 2 ? 10 : 12}</span></div>
              <div className="property-info"><h3>{p.title}</h3><div className="property-specs"><span>▣ {p.rooms || "—"} غرف</span><span>▤ {p.baths} حمام</span><span>⌗ {p.size}م²</span></div><div className="price-row"><strong>{p.price} <small>جنيه</small></strong><span>{p.deal}</span></div><div className="card-actions"><a href="#contact" className="details-btn">تفاصيل الإعلان ←</a><a href="https://wa.me/?text=أريد%20الاستفسار%20عن%20عقار%20في%20حدائق%20الأهرام" className="whatsapp-btn" target="_blank" rel="noreferrer">تواصل الآن ◉</a></div></div>
            </article>)}
          </div>
          {filtered.length === 0 && <div className="empty">لا توجد إعلانات مطابقة. جرّب تغيير خيارات البحث.</div>}
          <p className="demo-note">الإعلانات والأسعار المعروضة تجريبية لتوضيح شكل الموقع، وسيتم استبدالها ببيانات حقيقية عند إضافة الإعلانات.</p>
        </div>
        <aside className="sidebar">
          <div className="side-card map-card"><h3>📍 خريطة حدائق الأهرام</h3><div className="map-art"><span className="map-road road-a" /><span className="map-road road-b" /><span className="map-road road-c" /><span className="map-pin">●</span><b>حدائق الأهرام</b><div className="map-zoom">＋<br/>－</div></div></div>
          <div className="side-card prices-card" id="prices"><h3>▥ متوسط سعر المتر بالمنطقة</h3><div className="price-columns"><div><b>الأولى</b><strong>16,000</strong><small>ج.م</small></div><div><b>الثانية</b><strong>17,000</strong><small>ج.م</small></div><div><b>الثالثة</b><strong>18,000</strong><small>ج.م</small></div><div><b>الرابعة</b><strong>15,000</strong><small>ج.م</small></div></div><small className="price-disclaimer">أرقام توضيحية وليست تسعيراً رسمياً.</small></div>
        </aside>
      </section>

      <section className="cta-strip" id="about"><div className="container cta-inner"><span className="cta-plus">＋</span><strong>أضف إعلانك الآن</strong><p>معانا تضمن أفضل صفقة في حدائق الأهرام</p><span className="cta-hand">🤝</span></div></section>
      <footer id="contact"><div className="container footer-inner"><a className="brand footer-brand" href="#"><span className="brand-symbol">⌂</span><span><strong>حدائق الأهرام</strong><small>عقاراتك في المكان الصح</small></span></a><p>منصتك العقارية المتخصصة في حدائق الأهرام.</p><a href="mailto:hello@hadayekalahram.com">تواصل معنا</a></div><div className="copyright">© {new Date().getFullYear()} حدائق الأهرام — جميع الحقوق محفوظة</div></footer>
    </main>
  );
}
