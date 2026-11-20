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
  const phone=(listing?.phone||"").replace(/\D/g,"");
  const whatsappPhone=phone.startsWith("0")?"20"+phone.slice(1):phone;
  const whatsappMessage=encodeURIComponent("مرحباً، أنا مهتم بالعقار: "+(listing?.title||""));
  const dealLabel=listing?.deal_type==="بيع"?"للبيع":"للإيجار";

  return <main className="property-page" dir="rtl">
    <style>{`
      .property-page{min-height:100vh;background:#f4f7fa;color:#193653;font-family:Cairo,Tahoma,sans-serif}
      .property-header{background:#fff;border-bottom:1px solid #e8edf2;position:sticky;top:0;z-index:10}
      .property-header-inner{width:min(1160px,92%);margin:auto;height:76px;display:flex;align-items:center;justify-content:space-between}
      .property-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#102b4d}.property-brand-mark{width:42px;height:42px;border-radius:12px;background:#102b4d;color:#e2bb5b;display:grid;place-items:center;font-size:27px}.property-brand b,.property-brand small{display:block}.property-brand b{font-size:16px}.property-brand small{font-size:9px;color:#8593a2}
      .property-back{border:1px solid #e1e8ef;border-radius:9px;padding:10px 14px;text-decoration:none;color:#294c6c;font-size:10px;font-weight:900}
      .property-container{width:min(1120px,92%);margin:28px auto 65px}.property-breadcrumb{font-size:10px;color:#8290a0;margin-bottom:20px}.property-breadcrumb a{color:#a27b2b;text-decoration:none}
      .property-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:19px}.property-label{font-size:10px;color:#a27b2b;font-weight:900}.property-heading h1{font-size:25px;line-height:1.6;color:#102b4d;margin:5px 0}.property-location{font-size:11px;color:#7c8b9b}.property-price{background:#fff;border:1px solid #e7edf3;border-radius:13px;padding:13px 18px;white-space:nowrap;color:#102b4d;font-size:21px;font-weight:900;box-shadow:0 5px 20px #18355208}.property-price small{font-size:10px;color:#8190a0}
      .property-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start}.property-main{min-width:0}.property-gallery{background:#fff;border:1px solid #e6ebf1;border-radius:16px;padding:10px;box-shadow:0 6px 22px #18355208}.property-main-image{width:100%;height:440px;object-fit:cover;border-radius:11px;display:block;background:#edf1f5}.property-thumbs{display:flex;gap:8px;overflow:auto;padding-top:9px}.property-thumbs button{border:2px solid transparent;padding:0;border-radius:9px;overflow:hidden;width:82px;height:65px;flex:0 0 82px;background:#f0f3f6;cursor:pointer}.property-thumbs button.selected{border-color:#c69c3d}.property-thumbs img{width:100%;height:100%;object-fit:cover}
      .property-panel,.property-contact{background:#fff;border:1px solid #e6ebf1;border-radius:15px;padding:21px;margin-top:15px;box-shadow:0 6px 22px #18355208}.property-panel h2,.property-contact h2{font-size:16px;color:#102b4d;margin:0 0 15px}.property-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.property-fact{background:#f6f8fa;border:1px solid #edf1f4;border-radius:10px;padding:12px}.property-fact small{display:block;color:#8995a3;font-size:9px;margin-bottom:5px}.property-fact b{font-size:12px;color:#284766}.property-description{font-size:12px;color:#687b8e;line-height:2.2;white-space:pre-wrap;margin:0}.property-contact{position:sticky;top:95px;margin-top:0}.property-contact .property-label{display:block}.property-contact h2{font-size:19px;margin:7px 0}.property-contact p{font-size:11px;color:#8290a0;line-height:2;margin:0 0 17px}.property-whatsapp,.property-call{display:flex;align-items:center;justify-content:center;min-height:45px;border-radius:9px;text-decoration:none;font-size:11px;font-weight:900;margin-top:9px}.property-whatsapp{background:#18865b;color:#fff}.property-call{background:#102b4d;color:#fff}.property-safety{display:block;border-top:1px solid #edf0f3;margin-top:18px;padding-top:13px;color:#8995a3;font-size:9px;line-height:1.9}.property-state{background:#fff;border:1px solid #e7edf3;border-radius:14px;padding:45px 20px;text-align:center;color:#718195;font-size:12px;line-height:2}.property-state a{color:#a27b2b}
      @media(max-width:760px){.property-header-inner{height:66px}.property-container{margin-top:19px}.property-heading{align-items:flex-start;flex-direction:column;gap:10px}.property-heading h1{font-size:20px}.property-price{font-size:18px;padding:10px 14px}.property-layout{grid-template-columns:1fr}.property-main-image{height:290px}.property-contact{position:static;order:-1}.property-facts{grid-template-columns:repeat(2,1fr)}.property-panel,.property-contact{padding:16px}.property-back{padding:9px 10px;font-size:9px}}
    `}</style>
    <header className="property-header"><div className="property-header-inner"><a className="property-brand" href="/"><span className="property-brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><a className="property-back" href="/">← كل العقارات</a></div></header>
    <div className="property-container">
      <div className="property-breadcrumb"><a href="/">الرئيسية</a> / العقارات / التفاصيل</div>
      {loading?<div className="property-state">جارٍ تحميل تفاصيل العقار...</div>:error?<div className="property-state">{error}<p><a href="/">العودة للرئيسية</a></p></div>:<>
        <div className="property-heading"><div><span className="property-label">{listing.property_type} · {dealLabel}</span><h1>{listing.title}</h1><div className="property-location">⌖ {listing.gate||"حدائق الأهرام"}</div></div><div className="property-price">{money(listing.price)} <small>جنيه</small></div></div>
        <div className="property-layout">
          <section className="property-main">
            <div className="property-gallery"><img className="property-main-image" src={images[activeImage]} alt={listing.title}/>{images.length>1&&<div className="property-thumbs">{images.map((src,index)=><button key={src+index} className={activeImage===index?"selected":""} onClick={()=>setActiveImage(index)}><img src={src} alt={"صورة العقار "+(index+1)}/></button>)}</div>}</div>
            <div className="property-panel"><h2>مواصفات العقار</h2><div className="property-facts"><div className="property-fact"><small>نوع العملية</small><b>{dealLabel}</b></div><div className="property-fact"><small>نوع العقار</small><b>{listing.property_type}</b></div><div className="property-fact"><small>المساحة</small><b>{listing.area?money(listing.area)+" م²":"غير محدد"}</b></div><div className="property-fact"><small>البوابة</small><b>{listing.gate||"حدائق الأهرام"}</b></div>{listing.bedrooms?<div className="property-fact"><small>غرف النوم</small><b>{listing.bedrooms}</b></div>:null}{listing.bathrooms?<div className="property-fact"><small>الحمامات</small><b>{listing.bathrooms}</b></div>:null}</div><h2 style={{marginTop:24}}>تفاصيل ووصف العقار</h2><p className="property-description">{(listing.description||"لم يضف المعلن تفاصيل إضافية لهذا العقار.").replace(/^نوع الحساب:.*\n?/m,"")}</p></div>
          </section>
          <aside className="property-contact"><span className="property-label">هل العقار مناسب لك؟</span><h2>تواصل مع المعلن</h2><p>استفسر عن التفاصيل وحدد موعداً لمعاينة العقار على الطبيعة.</p>{phone?<><a className="property-whatsapp" href={`https://wa.me/${whatsappPhone}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">تواصل عبر واتساب</a><a className="property-call" href={`tel:${listing.phone}`}>اتصال هاتفي · {listing.phone}</a></>:<p>بيانات التواصل غير متاحة حالياً.</p>}<small className="property-safety">نصيحة: عاين العقار بنفسك وتأكد من صحة المستندات والبيانات قبل إتمام أي اتفاق.</small></aside>
        </div>
      </>}
    </div>
    <footer><div className="wrap footer-inner"><a className="logo" href="/"><span className="logo-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a><p>منصة عقارية متخصصة في حدائق الأهرام.</p><span>© {new Date().getFullYear()} جميع الحقوق محفوظة</span></div></footer>
  </main>;
}