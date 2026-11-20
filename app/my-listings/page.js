"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const money = n => new Intl.NumberFormat("ar-EG").format(Number(n || 0));
const labels = { pending:"قيد المراجعة", published:"منشور", rejected:"مرفوض" };

export default function MyListingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) { setError("الاتصال بقاعدة البيانات غير مكتمل."); setLoading(false); return; }
    const { data:{user:current}, error:authError } = await supabase.auth.getUser();
    if (authError || !current) { router.replace("/account"); return; }
    setUser(current);
    const [{data:profileData},{data:listingsData,error:listError}] = await Promise.all([
      supabase.from("profiles").select("full_name,phone,account_type,is_active").eq("id",current.id).maybeSingle(),
      supabase.from("listings").select("*").eq("submitted_by",current.id).order("created_at",{ascending:false})
    ]);
    if (profileData?.is_active === false) { await supabase.auth.signOut(); router.replace("/account"); setError("هذا الحساب موقوف حالياً. تواصل مع إدارة المنصة."); setLoading(false); return; }
    if (profileData) setProfile(profileData);
    if (listError) setError("تعذر تحميل إعلاناتك: "+listError.message);
    else setItems(listingsData || []);
    setLoading(false);
  },[router]);

  useEffect(()=>{load();},[load]);
  async function signOut(){await supabase?.auth.signOut();router.replace("/account");}

  const published=items.filter(x=>x.status==="published").length;
  const pending=items.filter(x=>x.status==="pending").length;
  const rejected=items.filter(x=>x.status==="rejected").length;

  return (
    <main className="my-page" dir="rtl">
      <style>{`
        .my-page{min-height:100vh;background:#f4f7fa;color:#193653;font-family:Cairo,Tahoma,sans-serif}.my-header{background:linear-gradient(110deg,#0c2441,#19466f);color:#fff;box-shadow:0 5px 22px #102b4d18}.my-header-inner{width:min(1160px,92%);margin:auto;min-height:78px;display:flex;align-items:center;justify-content:space-between;gap:15px}.my-brand{display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none}.my-brand-mark{width:43px;height:43px;border-radius:13px;background:#ffffff18;color:#e2bb5b;display:grid;place-items:center;font-size:28px}.my-brand b,.my-brand small{display:block}.my-brand b{font-size:17px}.my-brand small{font-size:9px;color:#c4d2e0}.my-header-actions{display:flex;align-items:center;gap:8px}.my-header-actions a,.my-header-actions button{border:1px solid #ffffff55;background:#ffffff12;color:#fff;border-radius:8px;padding:9px 13px;font-size:10px;font-weight:900;text-decoration:none;cursor:pointer}
        .my-content{width:min(1100px,92%);margin:32px auto 70px}.my-welcome{background:linear-gradient(115deg,#fff,#f8fafc);border:1px solid #e5ebf2;border-radius:17px;padding:25px 27px;display:flex;align-items:center;justify-content:space-between;gap:18px;box-shadow:0 8px 25px #18355208}.my-kicker{font-size:10px;color:#b58c31;font-weight:900}.my-welcome h1{font-size:24px;color:#102b4d;margin:5px 0}.my-welcome p{font-size:11px;color:#7d8b9c;margin:0;line-height:1.9}.my-account-type{background:#edf3f8;color:#244d75;border-radius:30px;padding:8px 13px;font-size:10px;font-weight:900;white-space:nowrap}
        .my-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin:16px 0 27px}.my-stat{background:#fff;border:1px solid #e7ecf2;border-radius:13px;padding:15px 17px;display:flex;align-items:center;gap:12px}.my-stat-icon{width:38px;height:38px;border-radius:11px;background:#edf3f8;color:#244d75;display:grid;place-items:center;font-size:17px}.my-stat small{display:block;color:#8491a1;font-size:10px}.my-stat b{font-size:21px;color:#173653}
        .my-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.my-section-head h2{font-size:18px;color:#102b4d;margin:0}.my-add{background:#d9ad43;color:#102b4d;padding:11px 16px;border-radius:9px;text-decoration:none;font-size:11px;font-weight:900;box-shadow:0 5px 14px #d9ad4325}.my-list{display:grid;gap:12px}.my-card{background:#fff;border:1px solid #e6ebf1;border-radius:14px;padding:13px;display:flex;align-items:center;gap:15px;box-shadow:0 5px 18px #18355206;transition:.18s}.my-card:hover{transform:translateY(-2px);box-shadow:0 10px 25px #18355210}.my-photo{width:122px;height:96px;flex:0 0 122px;border-radius:10px;object-fit:cover;background:#edf1f5}.my-card-info{flex:1;min-width:0}.my-card-info h3{font-size:13px;color:#193653;margin:0 0 5px}.my-card-info p{font-size:10px;color:#8491a1;margin:0}.my-card-price{font-size:15px;font-weight:900;color:#102b4d;margin-top:7px}.my-status{display:inline-block;padding:7px 11px;border-radius:30px;font-size:9px;font-weight:900;white-space:nowrap}.my-status.pending{background:#fff5df;color:#a2761f}.my-status.published{background:#e8f6ef;color:#18764e}.my-status.rejected{background:#fceeee;color:#a63d3d}.my-empty,.my-error{background:#fff;border:1px solid #e7ecf2;border-radius:14px;text-align:center;padding:42px 20px;color:#7c8a9a;font-size:12px;line-height:2}.my-empty-icon{width:52px;height:52px;border-radius:16px;background:#edf3f8;color:#b58c31;display:grid;place-items:center;font-size:25px;margin:0 auto 12px}.my-error{background:#fff5f3;color:#a33}.my-loading{text-align:center;padding:50px;color:#7c8a9a;font-size:12px}
        @media(max-width:650px){.my-header-inner{min-height:68px}.my-brand b{font-size:14px}.my-header-actions a{display:none}.my-content{margin-top:20px}.my-welcome{align-items:flex-start;flex-direction:column;padding:20px}.my-welcome h1{font-size:21px}.my-stats{gap:8px}.my-stat{padding:11px 9px;gap:7px}.my-stat-icon{width:31px;height:31px}.my-stat small{font-size:8px}.my-stat b{font-size:18px}.my-section-head h2{font-size:15px}.my-add{padding:9px 11px;font-size:9px}.my-card{gap:10px;padding:10px;flex-wrap:wrap}.my-photo{width:88px;height:78px;flex-basis:88px}.my-card-info h3{font-size:11px}.my-card-price{font-size:12px}.my-status{margin-right:auto}.my-welcome p{font-size:10px}}
        @media(max-width:380px){.my-stats{grid-template-columns:1fr 1fr}.my-stat:last-child{grid-column:1/-1}}
      `}</style>
      <header className="my-header"><div className="my-header-inner">
        <a className="my-brand" href="/"><span className="my-brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>حسابي العقاري</small></span></a>
        <div className="my-header-actions"><a href="/">الصفحة الرئيسية</a><button onClick={signOut}>تسجيل الخروج</button></div>
      </div></header>
      <section className="my-content">
        <div className="my-welcome"><div><span className="my-kicker">مساحتك الخاصة</span><h1>أهلاً بك، {profile?.full_name || user?.email || "في حسابك"}</h1><p>{user?.email} · تابع إعلاناتك وحالة مراجعتها من مكان واحد.</p></div><span className="my-account-type">{profile?.account_type || "حساب عقاري"}</span></div>
        <div className="my-stats"><div className="my-stat"><span className="my-stat-icon">▤</span><div><small>كل إعلاناتي</small><b>{items.length}</b></div></div><div className="my-stat"><span className="my-stat-icon" style={{background:"#fff5df",color:"#a2761f"}}>◷</span><div><small>قيد المراجعة</small><b>{pending}</b></div></div><div className="my-stat"><span className="my-stat-icon" style={{background:"#e8f6ef",color:"#18764e"}}>✓</span><div><small>تم نشرها</small><b>{published}</b></div></div></div>
        <div className="my-section-head"><h2>إعلاناتي ({items.length})</h2><a className="my-add" href="/#listings">＋ أضف إعلاناً جديداً</a></div>
        {loading?<div className="my-loading">جارٍ تحميل إعلاناتك...</div>:error?<div className="my-error">{error}</div>:items.length===0?<div className="my-empty"><span className="my-empty-icon">⌂</span><b>لسه مفيش إعلانات عندك</b><div>ابدأ بإضافة عقارك وسيظهر هنا لمتابعة حالته بعد الإرسال.</div><a className="my-add" style={{display:"inline-block",marginTop:15}} href="/#listings">إضافة أول إعلان</a></div>:
          <div className="my-list">{items.map(item=><article key={item.id} className="my-card">
            {item.image_urls?.[0]?<img className="my-photo" src={item.image_urls[0]} alt={item.title||"صورة العقار"}/>:<div className="my-photo" style={{display:"grid",placeItems:"center",color:"#b58c31",fontSize:26}}>⌂</div>}
            <div className="my-card-info"><h3>{item.title||item.property_type}</h3><p>{item.gate||"حدائق الأهرام"} · {item.property_type} · {item.area||"—"} م²</p><div className="my-card-price">{money(item.price)} جنيه</div></div>
            <span className={"my-status "+(item.status||"pending")}>{labels[item.status]||item.status}</span>
          </article>)}</div>}
      </section>
    </main>
  );
}
