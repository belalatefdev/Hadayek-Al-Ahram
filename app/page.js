"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const sampleListings = [
  { id: 1, title: "شقة ١٤٠ متر تشطيب سوبر لوكس", gate: "البوابة الأولى", kind: "شقة", deal: "للبيع", price: 2450000, area: 140, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85", tag: "اختيار مميز" },
  { id: 2, title: "شقة للإيجار قريبة من الخدمات", gate: "البوابة الثانية", kind: "شقة", deal: "للإيجار", price: 14000, area: 125, rooms: 2, baths: 1, image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85", tag: "جديد" },
  { id: 3, title: "دوبلكس بحديقة خاصة", gate: "البوابة الرابعة", kind: "دوبلكس", deal: "للبيع", price: 4800000, area: 230, rooms: 4, baths: 3, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85", tag: "مساحة كبيرة" },
  { id: 4, title: "شقة عائلية بإطلالة مفتوحة", gate: "البوابة الخامسة", kind: "شقة", deal: "للبيع", price: 1980000, area: 132, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85", tag: "فرصة" },
  { id: 5, title: "محل تجاري بموقع حيوي", gate: "البوابة الأولى", kind: "تجاري", deal: "للإيجار", price: 18000, area: 75, rooms: 0, baths: 1, image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=85", tag: "موقع مميز" },
  { id: 6, title: "شقة واسعة بالقرب من البوابة", gate: "البوابة الثالثة", kind: "شقة", deal: "للإيجار", price: 16000, area: 155, rooms: 3, baths: 2, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85", tag: "جديد" },
];
const gates = ["كل البوابات", "البوابة الأولى", "البوابة الثانية", "البوابة الثالثة", "البوابة الرابعة", "البوابة الخامسة"];
const money = (n) => new Intl.NumberFormat("ar-EG").format(n);

export default function Home() {
  const [deal, setDeal] = useState("الكل");
  const [kind, setKind] = useState("الكل");
  const [gate, setGate] = useState("كل البوابات");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadListings() {
      if (!supabase) { setLoadingListings(false); return; }
      const { data, error } = await supabase.from("listings").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (active && !error) setListings((data || []).map((p) => ({
        id: p.id, title: p.title, gate: p.gate || "حدائق الأهرام",
        kind: p.property_type, deal: p.deal_type === "بيع" ? "للبيع" : "للإيجار",
        price: Number(p.price), area: Number(p.area || 0), rooms: p.bedrooms || 0,
        baths: p.bathrooms || 0, image: p.image_urls?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85", tag: "إعلان معتمد"
      })));
      if (active) setLoadingListings(false);
    }
    loadListings();
    return () => { active = false; };
  }, []);

  const filteredListings = useMemo(() => listings.filter((p) =>
    (deal === "الكل" || p.deal === deal) &&
    (kind === "الكل" || p.kind === kind) &&
    (gate === "كل البوابات" || p.gate === gate) &&
    (!maxPrice || p.price <= Number(maxPrice)) &&
    (p.title + p.gate + p.kind).includes(search.trim())
  ), [listings, deal, kind, gate, maxPrice, search]);

  const toggleFavorite = (id) => setFavorites((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);

  return (
    <main>
      <div className="topline"><div className="wrap topline-inner"><span>⌖ دليلك العقاري المتخصص في حدائق الأهرام</span><span>بيع • شراء • إيجار</span></div></div>
      <header className="header"><div className="wrap header-inner">
        <a className="logo" href="#"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a>
        <nav><a href="#home">الرئيسية</a><a href="#listings">عقارات للبيع</a><a href="#listings">عقارات للإيجار</a><a href="#map">الخريطة</a></nav>
        <div style={{display:"flex",alignItems:"center",gap:10}}><a href="/login" style={{fontSize:11,fontWeight:800,color:"#52657d"}}>دخول الإدارة</a><button className="add-top" onClick={() => { setSubmitted(false); setShowForm(true); }}>＋ أضف عقارك</button></div>
      </div></header>

      <section className="hero" id="home">
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <div className="hero-pill"><i /> منصة عقارية متخصصة في المنطقة</div>
          <h1>بيتك الجديد<br/><em>يبدأ من هنا</em></h1>
          <p>اكتشف أفضل فرص البيع والإيجار في حدائق الأهرام<br/>وابحث عن العقار المناسب ليك بسهولة.</p>
          <div className="hero-actions"><a href="#listings" className="primary-btn">اكتشف العقارات <span>←</span></a><button className="outline-btn" onClick={() => { setSubmitted(false); setShowForm(true); }}>اعرض عقارك مجاناً</button></div>
        </div>
        <div className="wrap search-wrap"><div className="search-box">
          <label><span>نوع العملية</span><select value={deal} onChange={e=>setDeal(e.target.value)}><option>الكل</option><option>للبيع</option><option>للإيجار</option></select></label>
          <label><span>نوع العقار</span><select value={kind} onChange={e=>setKind(e.target.value)}><option>الكل</option><option>شقة</option><option>دوبلكس</option><option>تجاري</option></select></label>
          <label><span>المنطقة / البوابة</span><select value={gate} onChange={e=>setGate(e.target.value)}>{gates.map(g=><option key={g}>{g}</option>)}</select></label>
          <label><span>أقصى سعر بالجنيه</span><input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} inputMode="numeric" placeholder="مثال: 2500000"/></label>
          <label className="search-text"><span>كلمة بحث</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن منطقة أو مواصفات"/></label>
          <a className="search-btn" href="#listings">ابحث الآن <b>⌕</b></a>
        </div></div>
      </section>

      <section className="wrap quick-stats">
        <div><b>⌂</b><strong>منطقة واحدة</strong><small>تركيز كامل على حدائق الأهرام</small></div>
        <div><b>⌕</b><strong>بحث ذكي</strong><small>وصل للعقار المناسب أسرع</small></div>
        <div><b>♡</b><strong>قائمة مفضلة</strong><small>احتفظ بالعقارات المهمة</small></div>
        <div><b>♧</b><strong>إعلانات الملاك والوسطاء</strong><small>فرص متنوعة في مكان واحد</small></div>
      </section>

      <section className="wrap listings-section" id="listings">
        <div className="section-head"><div><span className="eyebrow">اختار صح</span><h2>عقارات مميزة في حدائق الأهرام</h2><p>تصفح أحدث الفرص المتاحة في البوابات المختلفة.</p></div><div className="result-count">{filteredListings.length} عقار</div></div>
        <div className="listing-grid">
          {filteredListings.map(p=><article className="listing-card" key={p.id}>
            <div className="listing-photo"><img src={p.image} alt={p.title}/><span className="tag">{p.tag}</span><button aria-label="إضافة للمفضلة" className={favorites.includes(p.id)?"heart active":"heart"} onClick={()=>toggleFavorite(p.id)}>{favorites.includes(p.id)?"♥":"♡"}</button><span className="deal-tag">{p.deal}</span></div>
            <div className="listing-body"><div className="location">⌖ {p.gate}</div><h3>{p.title}</h3><div className="features"><span>▦ {p.area} م²</span><span>▤ {p.rooms || "—"} غرف</span><span>♧ {p.baths} حمام</span></div><div className="listing-bottom"><strong>{money(p.price)} <small>جنيه</small></strong><button onClick={()=>{setSubmitted(false);setShowForm(true);}}>استفسر عن العقار</button></div></div>
          </article>)}
        </div>
        {!loadingListings && filteredListings.length === 0 && <p className="sample-warning">لا توجد إعلانات منشورة مطابقة لبحثك حالياً. جرّب تغيير عوامل البحث أو عُد لاحقاً.</p>}
        {loadingListings && <p className="sample-warning">جارٍ تحميل العقارات المنشورة...</p>}
      </section>

      <section className="map-section" id="map"><div className="wrap map-layout"><div><span className="eyebrow">اعرف منطقتك</span><h2>كل حدائق الأهرام في مكان واحد</h2><p>هنضيف خريطة تفاعلية لعرض مواقع العقارات حسب البوابة والشارع، بحيث تقدر تختار العقار من الخريطة مباشرة.</p><a className="primary-btn" href="#listings">تصفح العقارات</a></div><div className="map-preview"><div className="map-grid"><span className="pin pin1">●</span><span className="pin pin2">●</span><span className="pin pin3">●</span><b>حدائق الأهرام</b></div><small>تصور مبدئي للخريطة — سيتم ربطها بمواقع العقارات الفعلية</small></div></div></section>

      <section className="owner-cta"><div className="wrap owner-inner"><div><span className="eyebrow light">عندك عقار؟</span><h2>اعرض عقارك للباحثين عن بيتهم الجديد</h2><p>سواء كنت مالك أو وسيط عقاري، ابدأ طلب إضافة إعلانك.</p></div><button onClick={()=>{setSubmitted(false);setShowForm(true);}}>＋ أضف إعلانك الآن</button></div></section>
      <footer><div className="wrap footer-inner"><a className="logo" href="#"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><p>منصة عقارية متخصصة في حدائق الأهرام.</p><span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span></div></footer>

      {showForm && <div className="modal-backdrop" onClick={()=>setShowForm(false)}><div className="listing-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setShowForm(false)}>×</button>
        {submitted ? <div className="success-state"><div>✓</div><h2>استلمنا بياناتك المبدئية</h2><p>تم استلام إعلانك وحفظه بنجاح، وسيظهر بعد مراجعته واعتماده من إدارة المنصة.</p><button className="primary-btn" onClick={()=>setShowForm(false)}>حسناً</button></div> : <>
          <span className="eyebrow">إضافة عقار</span><h2>ابدأ بإضافة إعلانك</h2><p className="modal-intro">املأ البيانات الأساسية. الإعلان لن يظهر للزوار إلا بعد مراجعته واعتماده.</p>
          <form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;setSubmitError("");if(!supabase){setSubmitError("الاتصال بقاعدة البيانات غير مكتمل. حاول لاحقاً.");return;}const fd=new FormData(e.currentTarget);const propertyType=fd.get("property_type");const dealType=fd.get("deal_type");const imageFiles=fd.getAll("images").filter(file=>file && file.size>0);if(imageFiles.length>6){setSubmitError("يمكنك رفع 6 صور كحد أقصى.");return;}if(imageFiles.some(file=>!file.type.startsWith("image/")||file.size>5*1024*1024)){setSubmitError("تأكد أن كل الملفات صور وألا يتجاوز حجم الصورة الواحدة 5 ميجابايت.");return;}const imageUrls=[];for(const file of imageFiles){const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path=`listings/${Date.now()}-${crypto.randomUUID()}-${safeName}`;const {error:uploadError}=await supabase.storage.from("listing-images").upload(path,file,{cacheControl:"3600",upsert:false});if(uploadError){setSubmitError("تعذر رفع الصور: "+uploadError.message);return;}const {data:publicData}=supabase.storage.from("listing-images").getPublicUrl(path);imageUrls.push(publicData.publicUrl);}const {data:{user}}=await supabase.auth.getUser();const {error}=await supabase.from("listings").insert({title:`${propertyType} ${dealType} في ${fd.get("gate")}`,deal_type:dealType,property_type:propertyType,gate:fd.get("gate"),price:Number(fd.get("price")),area:Number(fd.get("area")),contact_name:fd.get("contact_name"),phone:fd.get("phone"),image_urls:imageUrls,description:`نوع الحساب: ${fd.get("account_type")}\n${fd.get("description")||""}`,status:"pending",submitted_by:user?.id||null,submitted_email:user?.email||null});if(error){setSubmitError("تعذر حفظ الإعلان: "+error.message);return;}setSubmitted(true);form.reset();}}>
            <div className="form-grid"><label>نوع الحساب<select name="account_type" required><option value="">اختر</option><option>مالك</option><option>وسيط عقاري</option></select></label><label>نوع العملية<select name="deal_type" required><option value="">اختر</option><option value="بيع">بيع</option><option value="إيجار">إيجار</option></select></label><label>نوع العقار<select name="property_type" required><option value="">اختر</option><option>شقة</option><option>دوبلكس</option><option>محل تجاري</option><option>أرض</option><option>فيلا</option></select></label><label>البوابة<select name="gate" required>{gates.slice(1).map(g=><option key={g}>{g}</option>)}</select></label><label>السعر بالجنيه<input name="price" required type="number" min="1" placeholder="السعر"/></label><label>المساحة بالمتر<input name="area" required type="number" min="1" placeholder="المساحة"/></label><label>الاسم<input name="contact_name" required placeholder="الاسم بالكامل"/></label><label>رقم الموبايل<input name="phone" required type="tel" placeholder="01xxxxxxxxx"/></label></div>
            <label className="full-label">صور العقار (حتى 6 صور، 5 ميجابايت للصورة)<input name="images" type="file" accept="image/*" multiple style={{height:"auto",padding:"10px"}}/><small style={{color:"#8793a3",fontSize:10}}>اختار صور واضحة للعقار من الموبايل أو الكمبيوتر. الصور اختيارية حالياً.</small></label><label className="full-label">تفاصيل إضافية<textarea name="description" rows="3" placeholder="الدور، التشطيب، عدد الغرف، العنوان بالتفصيل..."/></label>
            {submitError && <p role="alert" className="sample-warning">{submitError}</p>}
            <button className="submit-listing" type="submit">إرسال الإعلان للمراجعة</button>
          </form>
        </>}
      </div></div>}
    </main>
  );
}
