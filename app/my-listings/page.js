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
      supabase.from("profiles").select("full_name,phone,account_type").eq("id",current.id).maybeSingle(),
      supabase.from("listings").select("*").eq("submitted_by",current.id).order("created_at",{ascending:false})
    ]);
    if (profileData) setProfile(profileData);
    if (listError) setError("تعذر تحميل إعلاناتك: "+listError.message);
    else setItems(listingsData || []);
    setLoading(false);
  },[router]);

  useEffect(()=>{load();},[load]);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/account");
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f4f6fa",fontFamily:"Cairo,Tahoma,sans-serif",color:"#193653"}}>
      <header style={{background:"#102b4d",color:"#fff",padding:"16px 5%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div><b style={{fontSize:18}}>حسابي العقاري</b><div style={{fontSize:10,color:"#c4d2e0"}}>منصة حدائق الأهرام</div></div>
        <div style={{display:"flex",gap:8}}><a href="/" style={{color:"#fff",textDecoration:"none",padding:9,fontSize:11}}>الموقع</a><button onClick={signOut} style={{background:"#ffffff18",border:"1px solid #ffffff55",borderRadius:8,color:"#fff",padding:"8px 12px",cursor:"pointer"}}>خروج</button></div>
      </header>
      <section style={{width:"min(1050px,92%)",margin:"28px auto"}}>
        <div style={{background:"#fff",padding:22,borderRadius:14,marginBottom:17,border:"1px solid #e7ecf2"}}>
          <div style={{fontSize:11,color:"#b58c31",fontWeight:900}}>مرحباً بك</div>
          <h1 style={{fontSize:23,margin:"5px 0"}}>{profile?.full_name || user?.email || "حسابي"}</h1>
          <p style={{fontSize:12,color:"#7c8a9a",margin:0}}>{profile?.account_type || "حساب عقاري"} · {user?.email}</p>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
          <h2 style={{fontSize:19,margin:0}}>إعلاناتي ({items.length})</h2>
          <a href="/#listings" style={{background:"#b58c31",color:"#fff",padding:"10px 15px",borderRadius:8,textDecoration:"none",fontSize:12,fontWeight:900}}>＋ أضف إعلاناً</a>
        </div>
        {loading?<p>جارٍ تحميل إعلاناتك...</p>:error?<p style={{background:"#fff2f0",padding:13,borderRadius:8,color:"#a33"}}>{error}</p>:items.length===0?<div style={{background:"#fff",padding:30,textAlign:"center",borderRadius:12,color:"#7c8a9a"}}>لم ترسل أي إعلانات حتى الآن. يمكنك إضافة عقارك من الصفحة الرئيسية.</div>:
          <div style={{display:"grid",gap:12}}>{items.map(item=><article key={item.id} style={{background:"#fff",border:"1px solid #e7ecf2",borderRadius:12,padding:15,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
            {item.image_urls?.[0]&&<img src={item.image_urls[0]} alt="" style={{width:105,height:85,objectFit:"cover",borderRadius:8}}/>}
            <div style={{flex:1,minWidth:180}}><b>{item.title}</b><div style={{fontSize:11,color:"#7c8a9a",marginTop:6}}>{item.gate} · {item.property_type} · {item.area||"—"} م²</div><strong style={{display:"block",marginTop:7}}>{money(item.price)} جنيه</strong></div>
            <span style={{fontSize:11,fontWeight:900,padding:"7px 11px",borderRadius:20,background:item.status==="published"?"#e8f6ef":item.status==="rejected"?"#fceeee":"#fff5df",color:item.status==="published"?"#18764e":item.status==="rejected"?"#a63d3d":"#a2761f"}}>{labels[item.status]||item.status}</span>
          </article>)}</div>}
      </section>
    </main>
  );
}
