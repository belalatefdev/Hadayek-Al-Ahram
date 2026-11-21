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
  const [paymentMethod, setPaymentMethod] = useState("كاش");
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadListings() {
      if (!supabase) { setLoadingListings(false); return; }
      const { data, error } = await supabase.from("listings").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (active && !error) setListings((data || []).map((p) => ({
        id: p.id, title: p.title, gate: p.gate || "حدائق الأهرام",
        kind: p.property_type, deal: p.deal_type === "بيع" ? "للبيع" : "للإيجار",
        price: Number(p.price), priceUnit: p.price_unit || "إجمالي العقار", paymentMethod: p.payment_method || "كاش", downPayment: p.down_payment, installmentYears: p.installment_years, monthlyInstallment: p.monthly_installment, area: Number(p.area || 0), rooms: p.bedrooms || 0,
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
      <div className="topline"><div className="wrap topline-inner"><span>★ منصتك العقارية من قلب الجيزة</span><span>بيع • شراء • إيجار</span></div></div>
      <header className="header"><div className="wrap header-inner">
        <a className="logo" href="#"><img className="logo-image" src="/logo-mark.svg" alt="" /><span><b>حدائق الأهرام</b><small>عقارك بالقرب من الأهرامات</small></span></a>
        <nav><a href="#home">الرئيسية</a><a href="#listings">عقارات للبيع</a><a href="#listings">عقارات للإيجار</a><a href="#map">الخريطة</a></nav>
        <div style={{display:"flex",alignItems:"center",gap:10}}><a href="/account" style={{fontSize:11,fontWeight:800,color:"#52657d"}}>حسابي</a><button className="add-top" onClick={() => { setSubmitted(false); setShowForm(true); }}>＋ أضف عقارك</button></div>
      </div></header>

      <section className="hero" id="home">
        <div className="hero-shade" />
        <div className="wrap hero-content">
          <div className="hero-pill"><i /> منصة عقارية متخصصة في المنطقة</div>
          <h1>منصة حدائق الأهرام<br/><em>عقارك بالقرب من الأهرامات</em></h1>
          <p>من قلب الجيزة، اكتشف أفضل فرص البيع والإيجار في حدائق الأهرام.<br/>ابحث عن بيتك الجديد بخطوات بسيطة وآمنة.</p>
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
            <div className="listing-body"><div className="location">⌖ {p.gate}</div><h3>{p.title}</h3><div className="features"><span>▦ {p.area} م²</span><span>▤ {p.rooms || "—"} غرف</span><span>♧ {p.baths} حمام</span></div><div className="listing-bottom"><strong>{money(p.price)} <small>جنيه {p.deal==="للإيجار"?"شهرياً":p.priceUnit==="سعر المتر"?"للمتر":"إجمالي"}</small><span style={{display:"block",marginTop:5,fontSize:9,fontWeight:800,color:p.paymentMethod==="تقسيط"?"#a2761f":"#53708b"}}>{p.paymentMethod||"كاش"}{p.paymentMethod==="تقسيط"&&p.installmentYears?` · ${p.installmentYears} سنة`:""}</span></strong><a className="details-link" href={`/listing/${p.id}`}>تفاصيل العقار ←</a></div></div>
          </article>)}
        </div>
        {!loadingListings && filteredListings.length === 0 && <p className="sample-warning">لا توجد إعلانات منشورة مطابقة لبحثك حالياً. جرّب تغيير عوامل البحث أو عُد لاحقاً.</p>}
        {loadingListings && <p className="sample-warning">جارٍ تحميل العقارات المنشورة...</p>}
      </section>

      <section className="map-section" id="map"><div className="wrap map-layout"><div className="map-copy"><span className="eyebrow">اعرف منطقتك</span><h2>خريطة حدائق الأهرام من Google</h2><p>استكشف البوابات والشوارع والخدمات المحيطة بالعقار بسهولة. حرّك الخريطة وكبّرها أو افتحها مباشرةً في خرائط Google للحصول على الاتجاهات.</p><a className="primary-btn" href="https://www.google.com/maps/search/?api=1&query=Hadayek+Al+Ahram%2C+Giza%2C+Egypt" target="_blank" rel="noreferrer">افتح الخريطة على Google Maps ↗</a></div><div className="google-map-frame"><iframe title="خريطة حدائق الأهرام على Google Maps" src="https://www.google.com/maps?q=Hadayek+Al+Ahram%2C+Giza%2C+Egypt&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div></div></section>

      <section className="owner-cta"><div className="wrap owner-inner"><div><span className="eyebrow light">عندك عقار؟</span><h2>اعرض عقارك للباحثين عن بيتهم الجديد</h2><p>سواء كنت مالك أو وسيط عقاري، ابدأ طلب إضافة إعلانك.</p></div><button onClick={()=>{setSubmitted(false);setShowForm(true);}}>＋ أضف إعلانك الآن</button></div></section>
      <footer><div className="wrap footer-inner"><a className="logo" href="#"><img className="logo-image" src="/logo-mark.svg" alt="" /><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><p>منصة عقارية متخصصة في حدائق الأهرام — عقارك بالقرب من الأهرامات.</p><span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span></div></footer>

      {showForm && <div className="modal-backdrop" onClick={()=>setShowForm(false)}><div className="listing-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setShowForm(false)}>×</button>
        {submitted ? <div className="success-state"><div>✓</div><h2>استلمنا بياناتك المبدئية</h2><p>تم استلام إعلانك وحفظه بنجاح، وسيظهر بعد مراجعته واعتماده من إدارة المنصة.</p><button className="primary-btn" onClick={()=>setShowForm(false)}>حسناً</button></div> : <>
          <span className="eyebrow">إضافة عقار</span><h2>ابدأ بإضافة إعلانك</h2><p className="modal-intro">املأ البيانات الأساسية. الإعلان لن يظهر للزوار إلا بعد مراجعته واعتماده.</p>
          <form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;setSubmitError("");if(!supabase){setSubmitError("الاتصال بقاعدة البيانات غير مكتمل. حاول لاحقاً.");return;}const {data:{user}}=await supabase.auth.getUser();if(!user){setSubmitError("لازم تسجل حسابك أو تدخل لحسابك الأول قبل إرسال الإعلان.");return;}const {data:accountProfile,error:accountError}=await supabase.from("profiles").select("is_active").eq("id",user.id).maybeSingle();if(accountError||accountProfile?.is_active===false){setSubmitError("هذا الحساب موقوف حالياً أو غير مفعل. تواصل مع إدارة المنصة.");return;}const fd=new FormData(e.currentTarget);const propertyType=fd.get("property_type");const dealType=fd.get("deal_type");const imageFiles=fd.getAll("images").filter(file=>file && file.size>0);if(imageFiles.length>6){setSubmitError("يمكنك رفع 6 صور كحد أقصى.");return;}if(imageFiles.some(file=>!file.type.startsWith("image/")||file.size>5*1024*1024)){setSubmitError("تأكد أن كل الملفات صور وألا يتجاوز حجم الصورة الواحدة 5 ميجابايت.");return;}const imageUrls=[];for(const file of imageFiles){const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");const path=`listings/${Date.now()}-${crypto.randomUUID()}-${safeName}`;const {error:uploadError}=await supabase.storage.from("listing-images").upload(path,file,{cacheControl:"3600",upsert:false});if(uploadError){setSubmitError("تعذر رفع الصور: "+uploadError.message);return;}const {data:publicData}=supabase.storage.from("listing-images").getPublicUrl(path);imageUrls.push(publicData.publicUrl);}const {error}=await supabase.from("listings").insert({title:`${propertyType} ${dealType} في ${fd.get("gate")}`,deal_type:dealType,property_type:propertyType,gate:fd.get("gate"),price:Number(fd.get("price")),price_unit:fd.get("price_unit"),payment_method:fd.get("payment_method"),down_payment:fd.get("down_payment")?Number(fd.get("down_payment")):null,installment_years:fd.get("installment_years")?Number(fd.get("installment_years")):null,monthly_installment:fd.get("monthly_installment")?Number(fd.get("monthly_installment")):null,area:Number(fd.get("area")),bedrooms:fd.get("bedrooms")?Number(fd.get("bedrooms")):null,bathrooms:fd.get("bathrooms")?Number(fd.get("bathrooms")):null,floor:fd.get("floor")||null,finishing:fd.get("finishing")||null,building_age:fd.get("building_age")||null,address_details:fd.get("address_details")||null,contact_name:fd.get("contact_name"),phone:fd.get("phone"),image_urls:imageUrls,description:`نوع الحساب: ${fd.get("account_type")}\n${fd.get("description")||""}`,status:"pending",submitted_by:user?.id||null,submitted_email:user?.email||null});if(error){setSubmitError("تعذر حفظ الإعلان: "+error.message);return;}setSubmitted(true);form.reset();}}>
            <div className="form-grid"><label>نوع الحساب<select name="account_type" required><option value="">اختر</option><option>مالك</option><option>وسيط عقاري</option></select></label><label>نوع العملية<select name="deal_type" required><option value="">اختر</option><option value="بيع">بيع</option><option value="إيجار">إيجار</option></select></label><label>نوع العقار<select name="property_type" required><option value="">اختر</option><option>شقة</option><option>دوبلكس</option><option>محل تجاري</option><option>أرض</option><option>فيلا</option></select></label><label>البوابة<select name="gate" required>{gates.slice(1).map(g=><option key={g}>{g}</option>)}</select></label><label>السعر بالجنيه<input name="price" required type="number" min="1" placeholder="اكتب السعر"/></label><label>وحدة السعر<select name="price_unit" required><option value="إجمالي العقار">إجمالي العقار</option><option value="سعر المتر">سعر المتر</option><option value="شهريًا">شهريًا (إيجار)</option></select></label><label>طريقة الدفع<select name="payment_method" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} required><option value="كاش">كاش</option><option value="تقسيط">تقسيط</option></select></label>{paymentMethod==="تقسيط"&&<><label>مقدم (جنيه)<input name="down_payment" type="number" min="0" placeholder="قيمة المقدم"/></label><label>مدة التقسيط (سنوات)<input name="installment_years" type="number" min="1" max="40" placeholder="مثلاً 5"/></label><label>القسط الشهري (جنيه)<input name="monthly_installment" type="number" min="0" placeholder="قيمة القسط"/></label></>}<label>المساحة بالمتر<input name="area" required type="number" min="1" placeholder="المساحة"/></label><label>عدد غرف النوم<select name="bedrooms"><option value="">غير محدد</option>{[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}</select></label><label>عدد الحمامات<select name="bathrooms"><option value="">غير محدد</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label><label>الدور<input name="floor" placeholder="مثلاً الدور الرابع"/></label><label>التشطيب<select name="finishing"><option value="">اختر (اختياري)</option><option>بدون تشطيب</option><option>نصف تشطيب</option><option>تشطيب عادي</option><option>تشطيب سوبر لوكس</option><option>الترا سوبر لوكس</option></select></label><label>عمر المبنى<input name="building_age" placeholder="مثلاً 10 سنوات"/></label><label className="form-grid-wide">العنوان بالتفصيل<input name="address_details" placeholder="اسم الشارع، العمارة، علامة مميزة"/></label><label>الاسم<input name="contact_name" required placeholder="الاسم بالكامل"/></label><label>رقم الموبايل<input name="phone" required type="tel" placeholder="01xxxxxxxxx"/></label></div>
            <div className="listing-photo-upload"><label className="full-label">صور العقار <span className="photo-upload-subtitle">ارفع حتى 6 صور — الصورة الأولى هي الصورة الرئيسية</span><input name="images" type="file" accept="image/*" multiple style={{height:"auto",padding:"10px"}} onChange={e=>{const files=Array.from(e.target.files||[]).slice(0,6);setImagePreviews(files.map(f=>URL.createObjectURL(f)));}}/><small className="photo-upload-note">اختار صور واضحة للواجهة، غرف العقار، المطبخ والحمامات. الصور اختيارية.</small></label>{imagePreviews.length>0&&<div className="image-preview-grid">{imagePreviews.map((url,i)=><div className="image-preview-item" key={url}><img src={url} alt={"معاينة الصورة "+(i+1)}/><span>{i===0?"الصورة الرئيسية":`صورة ${i+1}`}</span></div>)}</div>}</div><label className="full-label">تفاصيل إضافية<textarea name="description" rows="3" placeholder="الدور، التشطيب، عدد الغرف، العنوان بالتفصيل..."/></label>
            {submitError && <div><p role="alert" className="sample-warning">{submitError}</p>{submitError.includes("تسجل حسابك") && <a href="/account" className="primary-btn" style={{display:"inline-flex",marginBottom:12}}>إنشاء حساب / تسجيل الدخول</a>}</div>}
            <button className="submit-listing" type="submit">إرسال الإعلان للمراجعة</button>
          </form>
        </>}
      </div></div>}
    </main>
  );
}
