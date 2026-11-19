"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "bilalatef88@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendLink(e) {
    e.preventDefault();
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setMessage("الدخول متاح حالياً لبريد المدير فقط.");
      return;
    }
    if (!supabase) {
      setMessage("إعدادات Supabase غير مكتملة. راجع متغيرات البيئة في Vercel.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setLoading(false);
    setMessage(error ? "تعذر إرسال رابط الدخول: " + error.message : "تم إرسال رابط الدخول إلى بريدك. افتح الرسالة واضغط الرابط للدخول إلى لوحة الإدارة.");
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20,background:"#f3f6fa",fontFamily:"Cairo,Tahoma,sans-serif"}}>
      <section style={{width:"min(440px,100%)",background:"#fff",padding:32,borderRadius:18,boxShadow:"0 15px 50px #102b4c18"}}>
        <a href="/" style={{color:"#b58c31",fontWeight:800,textDecoration:"none"}}>← العودة للموقع</a>
        <div style={{fontSize:13,color:"#b58c31",fontWeight:800,marginTop:28}}>لوحة إدارة حدائق الأهرام</div>
        <h1 style={{fontSize:27,color:"#102b4d",margin:"8px 0"}}>تسجيل دخول المدير</h1>
        <p style={{fontSize:13,color:"#738196",lineHeight:2}}>هنبعتلك رابط دخول آمن على بريد المدير المعتمد.</p>
        <form onSubmit={sendLink}>
          <label style={{display:"block",fontSize:12,fontWeight:800,color:"#42546c",margin:"20px 0 8px"}}>البريد الإلكتروني</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:"100%",height:48,border:"1px solid #dce4ed",borderRadius:9,padding:"0 13px",fontSize:14,boxSizing:"border-box"}} />
          <button disabled={loading} style={{width:"100%",height:48,marginTop:16,border:0,borderRadius:9,background:"#102b4d",color:"#fff",fontWeight:900,cursor:"pointer"}}>{loading?"جاري الإرسال...":"إرسال رابط الدخول"}</button>
        </form>
        {message && <p role="status" style={{marginTop:18,padding:12,borderRadius:9,background:"#f2f6fa",color:"#294663",fontSize:12,lineHeight:1.9}}>{message}</p>}
      </section>
    </main>
  );
}
