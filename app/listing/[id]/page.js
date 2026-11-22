"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const money = n => new Intl.NumberFormat("ar-EG").format(Number(n || 0));

export default function ListingDetails() {
  const params=useParams();
  const id=params?.id;
  const [listing,setListing]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [activeImage,setActiveImage]=useState(0);
  const [lightbox,setLightbox]=useState(false);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    let active=true;
    async function load(){
      if(!supabase||!id){setError("تعذر الاتصال بالموقع حالياً.");setLoading(false);return;}
      const {data,error:queryError}=await supabase.from("listings").select("*").eq("id",id).eq("status","published").single();
      if(!active)return;
      if(queryError||!data)setError("العقار غير موجود أو لم يتم اعتماده للنشر.");
      else setListing(data);
      setLoading(false);
    }
    load();return()=>{active=false;};
  },[id]);

  const images=listing?.image_urls?.length?listing.image_urls:["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"];
  const phone=(listing?.phone||"").replace(/\\D/g,"");
  const whatsappPhone=phone.startsWith("0")?"20"+phone.slice(1):phone;
  const whatsappMessage=encodeURIComponent("مرحباً، أنا مهتم بالعقار: "+(listing?.title||""));
  const dealLabel=listing?.deal_type==="بيع"?"للبيع":"للإيجار";
  const changeImage=(step)=>setActiveImage(i=>(i+step+images.length)%images.length);
  const priceUnit=listing?.deal_type==="إيجار"?"شهريًا":listing?.price_unit==="سعر المتر"?"للمتر":"إجمالي العقار";

  return <main className="property-page" dir="rtl">
    <style>{`
      .property-page{min-height:100vh;background:#f4f7fa;color:#193653;font-family:Cairo,Tahoma,sans-serif}
      .property-header{background:#fff;border-bottom:1px solid #e8edf2;position:sticky;top:0;z-index:10}
      .property-header-inner{width:min(1160px,92%);margin:auto;height:76px;display:flex;align-items:center;justify-content:space-between}
      .property-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#102b4d}.property-brand-mark{width:42px;height:42px;border-radius:12px;background:#102b4d;color:#e2bb5b;display:grid;place-items:center;font-size:27px}.property-brand b,.property-brand small{display:block}.property-brand b{font-size:16px}.property-brand small{font-size:9px;color:#8593a2}
      .property-back{border:1px solid #e1e8ef;border-radius:9px;padding:10px 14px;text-decoration:none;color:#294c6c;font-size:10px;font-weight:900}
      .property-container{width:min(1120px,92%);margin:25px auto 65px}.property-breadcrumb{font-size:10px;color:#8290a0;margin-bottom:18px}.property-breadcrumb a{color:#a27b2b;text-decoration:none}
      .property-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:22px;margin-bottom:16px;padding:24px;background:#fff;border:1px solid #e6ebf1;border-radius:18px;box-shadow:0 8px 24px #18355207}.property-title-wrap{min-width:0;flex:1}.property-label{font-size:11px;color:#a27b2b;font-weight:900}.property-heading h1{font-size:27px;line-height:1.55;color:#102b4d;margin:8px 0 10px}.property-location{font-size:12px;color:#7c8b9b}.property-meta-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.property-meta-chips span{background:#f3f6f9;color:#516a83;padding:6px 10px;border-radius:20px;font-size:10px;font-weight:800}.property-meta-chips span:first-child{background:#eaf6ef;color:#258454}.property-price-box{width:250px;flex-shrink:0;background:linear-gradient(145deg,#fffaf0,#fff);border:1px solid #f0dfbb;border-radius:14px;padding:15px 18px;text-align:right}.price-caption{color:#9a7a3c;font-size:10px;font-weight:800}.property-price{white-space:nowrap;color:#102b4d;font-size:25px;font-weight:900;margin-top:4px}.property-price small{font-size:12px;color:#8190a0}.price-unit{color:#8a7858;font-size:10px;font-weight:800}.price-per-meter{font-size:10px;color:#6c8297;margin-top:7px}.property-quick-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.property-quick-facts>div{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e6ebf1;border-radius:13px;padding:14px 17px}.quick-icon{width:38px;height:38px;display:grid;place-items:center;background:#f1f5f9;border-radius:11px;color:#b18b35;font-size:19px}.property-quick-facts b,.property-quick-facts small{display:block}.property-quick-facts b{color:#183b5d;font-size:15px}.property-quick-facts small{color:#8291a1;font-size:10px;margin-top:3px}
      .property-layout{display:grid;grid-template-columns:minmax(0,1fr) 315px;gap:20px;align-items:start}.property-main{min-width:0}
      .property-gallery{background:#fff;border:1px solid #e6ebf1;border-radius:17px;padding:11px;box-shadow:0 8px 26px #18355209}
      .property-image-stage{height:470px;position:relative;background:#e9eef4;border-radius:12px;overflow:hidden}.property-main-image{width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in}
      .gallery-counter{position:absolute;top:14px;left:14px;background:#102b4dcc;color:#fff;padding:7px 12px;border-radius:25px;font-size:11px;font-weight:800;backdrop-filter:blur(8px)}
      .gallery-nav{position:absolute;top:50%;transform:translateY(-50%);width:42px;height:42px;border:0;border-radius:50%;background:#ffffffdf;color:#173756;font-size:23px;box-shadow:0 3px 15px #0a203333}.gallery-prev{right:14px}.gallery-next{left:14px}
      .property-thumbs{display:flex;gap:9px;overflow:auto;padding:11px 2px 2px}.property-thumbs button{border:2px solid transparent;padding:0;border-radius:10px;overflow:hidden;width:92px;height:70px;flex:0 0 92px;background:#f0f3f6;cursor:pointer;position:relative}.property-thumbs button.selected{border-color:#c69c3d;box-shadow:0 0 0 2px #c69c3d22}.property-thumbs img{width:100%;height:100%;object-fit:cover;display:block}.thumb-number{position:absolute;bottom:3px;right:4px;background:#0d2948bb;color:white;border-radius:5px;font-size:9px;padding:2px 5px}
      .property-panel,.property-contact{background:#fff;border:1px solid #e6ebf1;border-radius:15px;padding:21px;margin-top:16px;box-shadow:0 6px 22px #18355208}.property-panel h2,.property-contact h2{font-size:16px;color:#102b4d;margin:0 0 15px}.property-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.property-fact{background:#f7f9fb;border:1px solid #edf1f4;border-radius:11px;padding:13px}.property-fact small{display:block;color:#8995a3;font-size:10px;margin-bottom:6px}.property-fact b{font-size:12px;color:#284766}.property-description{font-size:12px;color:#687b8e;line-height:2.2;white-space:pre-wrap;margin:0}.property-description-empty{background:#f8fafc;padding:15px;border-radius:10px;color:#8793a3}
      .property-contact{position:sticky;top:95px;margin-top:0}.property-contact .property-label{display:block}.property-contact h2{font-size:19px;margin:7px 0}.property-contact p{font-size:11px;color:#8290a0;line-height:2;margin:0 0 17px}.property-whatsapp,.property-call{display:flex;align-items:center;justify-content:center;min-height:47px;border-radius:10px;text-decoration:none;font-size:11px;font-weight:900;margin-top:9px}.property-whatsapp{background:#18865b;color:#fff}.property-call{background:#102b4d;color:#fff}.property-safety{display:block;border-top:1px solid #edf0f3;margin-top:18px;padding-top:13px;color:#8995a3;font-size:9px;line-height:1.9}
      .payment-summary{margin-top:14px;background:#fff9ec;border:1px solid #f0dfba;border-radius:13px;padding:15px}.payment-summary h3{font-size:13px;margin:0 0 10px;color:#9b762b}.payment-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.payment-grid div{background:#fff;border:1px solid #f1e7d2;border-radius:9px;padding:10px}.payment-grid small{display:block;color:#a18b60;font-size:9px;margin-bottom:4px}.payment-grid b{font-size:11px;color:#72551d}
      .property-state{background:#fff;border:1px solid #e7edf3;border-radius:14px;padding:45px 20px;text-align:center;color:#718195;font-size:12px;line-height:2}.property-state a{color:#a27b2b}
      .gallery-lightbox{position:fixed;inset:0;background:#061528f5;z-index:99;display:flex;align-items:center;justify-content:center;padding:25px}.lightbox-image{max-width:92vw;max-height:88vh;object-fit:contain}.lightbox-close{position:absolute;top:22px;left:22px;background:#fff;border:0;border-radius:50%;width:42px;height:42px;font-size:26px;color:#183653}.lightbox-arrow{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border:0;border-radius:50%;background:#ffffffdd;color:#163655;font-size:26px}.lightbox-left{left:25px}.lightbox-right{right:25px}
      @media(max-width:760px){.property-header-inner{height:66px}.property-container{margin-top:18px}.property-heading{align-items:stretch;flex-direction:column;gap:14px;padding:17px}.property-heading h1{font-size:20px}.property-price-box{width:100%;text-align:right}.property-price{font-size:22px}.property-quick-facts{grid-template-columns:repeat(2,1fr);gap:8px}.property-quick-facts>div{padding:11px;gap:9px}.property-layout{grid-template-columns:1fr}.property-image-stage{height:310px}.property-contact{position:static;order:-1}.property-facts{grid-template-columns:repeat(2,1fr)}.property-panel,.property-contact{padding:16px}.property-back{padding:9px 10px;font-size:9px}.lightbox-arrow{width:40px;height:40px}.gallery-lightbox{padding:10px}}
    `}</style>
    <header className="property-header"><div className="property-header-inner"><a className="property-brand" href="/"><span className="property-brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><a className="property-back" href="/">← كل العقارات</a></div></header>
    <div className="property-container">
      <div className="property-breadcrumb"><a href="/">الرئيسية</a> / العقارات / تفاصيل الإعلان</div>
      {loading?<div className="property-state">جارٍ تحميل تفاصيل العقار...</div>:error?<div className="property-state">{error}<p><a href="/">العودة للرئيسية</a></p></div>:<>
        <div className="property-heading"><div className="property-title-wrap"><span className="property-label">{listing.property_type} · {dealLabel}</span><h1>{listing.title}</h1><div className="property-location">⌖ {listing.gate||"حدائق الأهرام"}{listing.address_details? ` · ${listing.address_details}`:""}</div><div className="property-meta-chips"><span>✓ إعلان منشور</span><span>{listing.payment_method||"كاش"}</span>{listing.finishing&&<span>{listing.finishing}</span>}</div></div><div className="property-price-box"><small className="price-caption">السعر المطلوب</small><div className="property-price">{money(listing.price)} <small>جنيه</small></div><div className="price-unit">{priceUnit==="شهريًا"?"شهريًا":priceUnit==="للمتر"?"سعر المتر":"إجمالي العقار"}</div>{listing.area&&listing.deal_type==="بيع"&&listing.price_unit==="إجمالي العقار"&&<div className="price-per-meter">≈ {money(Math.round(Number(listing.price)/Number(listing.area)))} جنيه / م²</div>}</div></div>
        <div className="property-quick-facts"><div><span className="quick-icon">▦</span><span><b>{listing.area?money(listing.area):"—"}</b><small>المساحة م²</small></span></div><div><span className="quick-icon">▤</span><span><b>{listing.bedrooms||"—"}</b><small>غرف النوم</small></span></div><div><span className="quick-icon">♧</span><span><b>{listing.bathrooms||"—"}</b><small>الحمامات</small></span></div><div><span className="quick-icon">⌂</span><span><b>{listing.floor||"—"}</b><small>الدور</small></span></div></div>
        <div className="property-layout">
          <section className="property-main">
            <div className="property-gallery">
              <div className="property-image-stage"><img className="property-main-image" src={images[activeImage]} alt={listing.title} decoding="async" onClick={()=>setLightbox(true)}/><span className="gallery-counter">▧ {activeImage+1} / {images.length} صور</span>{images.length>1&&<><button className="gallery-nav gallery-prev" aria-label="الصورة السابقة" onClick={()=>changeImage(-1)}>›</button><button className="gallery-nav gallery-next" aria-label="الصورة التالية" onClick={()=>changeImage(1)}>‹</button></>}</div>
              {images.length>1&&<div className="property-thumbs">{images.map((src,index)=><button key={src+index} className={activeImage===index?"selected":""} onClick={()=>setActiveImage(index)} aria-label={"عرض الصورة "+(index+1)}><img src={src} alt={"صورة العقار "+(index+1)} loading="lazy" decoding="async"/><span className="thumb-number">{index+1}</span></button>)}</div>}
            </div>
            <div className="property-panel"><h2>تفاصيل العقار</h2><div className="property-facts">
              <div className="property-fact"><small>نوع العملية</small><b>{dealLabel}</b></div><div className="property-fact"><small>نوع العقار</small><b>{listing.property_type||"—"}</b></div><div className="property-fact"><small>المساحة</small><b>{listing.area?money(listing.area)+" م²":"غير محدد"}</b></div><div className="property-fact"><small>المنطقة</small><b>{listing.gate||"حدائق الأهرام"}</b></div>{listing.bedrooms?<div className="property-fact"><small>غرف النوم</small><b>{listing.bedrooms}</b></div>:null}{listing.bathrooms?<div className="property-fact"><small>الحمامات</small><b>{listing.bathrooms}</b></div>:null}<div className="property-fact"><small>طريقة الدفع</small><b>{listing.payment_method||"كاش"}</b></div>{listing.floor&&<div className="property-fact"><small>الدور</small><b>{listing.floor}</b></div>}{listing.finishing&&<div className="property-fact"><small>التشطيب</small><b>{listing.finishing}</b></div>}{listing.building_age&&<div className="property-fact"><small>عمر المبنى</small><b>{listing.building_age}</b></div>}{listing.address_details&&<div className="property-fact"><small>العنوان التفصيلي</small><b>{listing.address_details}</b></div>}</div>
              {listing.payment_method==="تقسيط"&&(listing.down_payment!=null||listing.installment_years||listing.monthly_installment!=null)&&<div className="payment-summary"><h3>تفاصيل نظام التقسيط</h3><div className="payment-grid">{listing.down_payment!=null&&<div><small>المقدم</small><b>{money(listing.down_payment)} جنيه</b></div>}{listing.installment_years&&<div><small>مدة التقسيط</small><b>{listing.installment_years} سنة</b></div>}{listing.monthly_installment!=null&&<div><small>القسط الشهري</small><b>{money(listing.monthly_installment)} جنيه</b></div>}</div></div>}
              <h2 style={{marginTop:25}}>وصف الإعلان</h2><p className={listing.description?.trim()?"property-description":"property-description-empty"}>{(listing.description||"لم يضف المعلن تفاصيل إضافية لهذا العقار.").replace(/^نوع الحساب:.*\n?/m,"").trim()}</p>
            </div>
          </section>
          <aside className="property-contact"><span className="property-label">مهتم بالعقار؟</span><h2>تواصل مع المعلن</h2><p>اسأل عن التفاصيل أو اتفق على موعد لمعاينة العقار.</p>{phone?<><a className="property-whatsapp" href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">تواصل عبر واتساب</a><a className="property-call" href={`tel:${listing.phone}`}>اتصال هاتفي · {listing.phone}</a></>:<p>بيانات التواصل غير متاحة حالياً.</p>}<div className="property-share">
        <div className="property-share-title">شارك الإعلان</div>
        <div className="property-share-buttons">
          <button type="button" className="share-whatsapp" onClick={()=>{const url=window.location.href;const text=encodeURIComponent((listing?.title||"عقار في حدائق الأهرام")+"\n"+url);window.open("https://wa.me/?text="+text,"_blank","noopener,noreferrer");}}>واتساب</button>
          <button type="button" className="share-facebook" onClick={()=>{window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(window.location.href),"_blank","noopener,noreferrer");}}>فيسبوك</button>
          <button type="button" className="share-copy" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{setCopied(false);}}}>{copied?"تم نسخ الرابط ✓":"نسخ الرابط"}</button>
        </div>
      </div>
<small className="property-safety">نصيحة: عاين العقار بنفسك وتأكد من صحة المستندات والبيانات قبل إتمام أي اتفاق.</small></aside>
</div>
        {phone&&<div className="property-mobile-contact"><a href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">واتساب المعلن</a><a href={`tel:${listing.phone}`}>اتصال مباشر</a></div>}
      </>}
    </div>
    {lightbox&&<div className="gallery-lightbox" onClick={()=>setLightbox(false)}><button className="lightbox-close" onClick={()=>setLightbox(false)}>×</button><img className="lightbox-image" src={images[activeImage]} alt={listing?.title||"صورة العقار"} onClick={e=>e.stopPropagation()}/>{images.length>1&&<><button className="lightbox-arrow lightbox-left" onClick={e=>{e.stopPropagation();changeImage(-1)}}>›</button><button className="lightbox-arrow lightbox-right" onClick={e=>{e.stopPropagation();changeImage(1)}}>‹</button></>}</div>}
    <footer><div className="wrap footer-inner"><a className="logo" href="/"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><p>منصة عقارية متخصصة في حدائق الأهرام.</p><span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span></div></footer>
  </main>;
}
