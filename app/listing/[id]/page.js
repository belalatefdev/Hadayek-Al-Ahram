"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const money = (n) => new Intl.NumberFormat("ar-EG").format(Number(n || 0));

export default function ListingDetails() {
  const params = useParams();
  const id = params?.id;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase || !id) { setError("تعذر الاتصال بالموقع حالياً."); setLoading(false); return; }
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).eq("status", "published").single();
      if (!active) return;
      if (error || !data) setError("العقار غير موجود أو لم يتم اعتماده للنشر.");
      else setListing(data);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [id]);

  const images = listing?.image_urls?.length ? listing.image_urls : ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"];
  const phone = (listing?.phone || "").replace(/\D/g, "");
  const whatsappPhone = phone.startsWith("0") ? "20" + phone.slice(1) : phone;
  const whatsappMessage = encodeURIComponent("مرحباً، أنا مهتم بالعقار: " + (listing?.title || ""));
  const dealLabel = listing?.deal_type === "بيع" ? "للبيع" : "للإيجار";

  return (
    <main className="details-page">
      <header className="header"><div className="wrap header-inner">
        <a className="logo" href="/"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a>
        <a className="add-top" href="/">العودة للرئيسية</a>
      </div></header>
      <div className="wrap details-wrap">
        <a className="back-link" href="/">← العودة إلى العقارات</a>
        {loading ? <p className="details-message">جارٍ تحميل تفاصيل العقار...</p> : error ? <div className="details-error">{error}<p><a href="/">العودة للرئيسية</a></p></div> : <>
          <div className="details-heading"><div><span className="eyebrow">{listing.property_type} · {dealLabel}</span><h1>{listing.title}</h1><p>⌖ {listing.gate || "حدائق الأهرام"}</p></div><strong>{money(listing.price)} <small>جنيه</small></strong></div>
          <div className="details-layout">
            <section className="details-main">
              <div className="details-gallery"><img className="details-main-image" src={images[activeImage]} alt={listing.title}/></div>
              {images.length > 1 && <div className="details-thumbs">{images.map((src,index)=><button key={src+index} className={activeImage===index?"selected":""} onClick={()=>setActiveImage(index)}><img src={src} alt={"صورة العقار "+(index+1)}/></button>)}</div>}
              <div className="details-panel"><h2>تفاصيل العقار</h2><div className="details-facts"><div><small>نوع العملية</small><b>{dealLabel}</b></div><div><small>نوع العقار</small><b>{listing.property_type}</b></div><div><small>المساحة</small><b>{listing.area ? money(listing.area)+" م²" : "غير محدد"}</b></div><div><small>البوابة</small><b>{listing.gate || "حدائق الأهرام"}</b></div>{listing.bedrooms ? <div><small>غرف النوم</small><b>{listing.bedrooms}</b></div> : null}{listing.bathrooms ? <div><small>الحمامات</small><b>{listing.bathrooms}</b></div> : null}</div>
                <h2>الوصف</h2><p className="details-description">{(listing.description || "لم يضف المعلن تفاصيل إضافية لهذا العقار.").replace(/^نوع الحساب:.*\n?/m,"")}</p>
              </div>
            </section>
            <aside className="contact-panel"><span className="eyebrow">مهتم بالعقار؟</span><h2>تواصل مع المعلن</h2><p>اسأل عن التفاصيل وحدد موعداً لمعاينة العقار.</p>{phone ? <><a className="whatsapp-button" href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">تواصل عبر واتساب</a><a className="call-button" href={`tel:${listing.phone}`}>اتصال هاتفي: {listing.phone}</a></> : <p className="details-description">بيانات التواصل غير متاحة حالياً.</p>}<small>تأكد من معاينة العقار والتحقق من بياناته قبل إتمام أي اتفاق.</small></aside>
          </div>
        </>}
      </div>
      <footer><div className="wrap footer-inner"><a className="logo" href="/"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><p>منصة عقارية متخصصة في حدائق الأهرام.</p><span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span></div></footer>
    </main>
  );
}
