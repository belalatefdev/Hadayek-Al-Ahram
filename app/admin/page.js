"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "bilalatef88@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) { setError("إعدادات Supabase غير مكتملة."); setChecking(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }
      if (!alive) return;
      setEmail(session.user.email);
      const { data, error: queryError } = await supabase.from("listings").select("*").order("created_at", {ascending:false});
      if (!alive) return;
      if (queryError) setError("قاعدة البيانات لم تُجهز بعد. نفّذ ملف إعداد قاعدة البيانات الموجود في مستودع GitHub. (" + queryError.message + ")");
      else setListings(data || []);
      setChecking(false);
    }
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL) router.replace("/login");
    }) || { data: { subscription: null } };
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, [router]);

  async function signOut() { await supabase?.auth.signOut(); router.replace("/login"); }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f3f6fa",fontFamily:"Cairo,Tahoma,sans-serif",color:"#182d47"}}>
      <header style={{background:"#102b4d",color:"#fff",padding:"18px 5%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div><b style={{fontSize:19}}>إدارة حدائق الأهرام</b><div style={{fontSize:11,opacity:.8}}>لوحة تحكم المدير</div></div>
        <button onClick={signOut} style={{border:"1px solid #ffffff66",background:"transparent",color:"#fff",borderRadius:8,padding:"9px 14px",cursor:"pointer"}}>تسجيل الخروج</button>
      </header>
      <section style={{width:"min(1100px,92%)",margin:"35px auto"}}>
        {checking ? <p>جارٍ التحقق من حساب المدير...</p> : <>
          <p style={{color:"#738196",fontSize:12}}>مسجل الدخول: {email}</p>
          <h1 style={{fontSize:27,color:"#102b4d"}}>مرحباً بك في لوحة الإدارة</h1>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,margin:"22px 0"}}>
            <div style={{background:"#fff",padding:20,borderRadius:13,border:"1px solid #e5ebf1"}}><div style={{fontSize:12,color:"#738196"}}>إجمالي الإعلانات</div><strong style={{fontSize:28}}>{listings.length}</strong></div>
            <div style={{background:"#fff",padding:20,borderRadius:13,border:"1px solid #e5ebf1"}}><div style={{fontSize:12,color:"#738196"}}>بانتظار المراجعة</div><strong style={{fontSize:28}}>{listings.filter(x=>x.status==="pending").length}</strong></div>
            <div style={{background:"#fff",padding:20,borderRadius:13,border:"1px solid #e5ebf1"}}><div style={{fontSize:12,color:"#738196"}}>الإعلانات المنشورة</div><strong style={{fontSize:28}}>{listings.filter(x=>x.status==="published").length}</strong></div>
          </div>
          {error && <div style={{background:"#fff7e8",border:"1px solid #f0dfbd",padding:15,borderRadius:10,fontSize:13,lineHeight:2}}>{error}</div>}
          <div style={{background:"#fff",border:"1px solid #e5ebf1",borderRadius:13,padding:20,marginTop:18}}>
            <h2 style={{fontSize:18,marginTop:0}}>الإعلانات</h2>
            {listings.length===0 ? <p style={{fontSize:13,color:"#738196"}}>لا توجد إعلانات محفوظة حالياً.</p> : <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{["العقار","النوع","السعر","الحالة","تاريخ الإضافة"].map(x=><th key={x} style={{textAlign:"right",padding:10,borderBottom:"1px solid #e5ebf1"}}>{x}</th>)}</tr></thead><tbody>{listings.map(x=><tr key={x.id}>{[x.title,x.property_type,x.price,x.status,new Date(x.created_at).toLocaleDateString("ar-EG")].map((v,i)=><td key={i} style={{padding:10,borderBottom:"1px solid #f0f2f5"}}>{v ?? "—"}</td>)}</tr>)}</tbody></table></div>}
          </div>
        </>}
      </section>
    </main>
  );
}
