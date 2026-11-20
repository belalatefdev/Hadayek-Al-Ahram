"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signup");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("مالك");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (active && data.session) {
        const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", data.session.user.id).maybeSingle();
        if (profile?.is_active === false) { await supabase.auth.signOut(); if (active) setMessage("هذا الحساب موقوف حالياً. تواصل مع إدارة المنصة."); }
        else if (active) router.replace("/my-listings");
      }
    }
    checkSession();
    return () => { active = false; };
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    if (!supabase) { setMessage("إعدادات الاتصال بقاعدة البيانات غير مكتملة."); return; }
    if (password.length < 8) { setMessage("كلمة المرور يجب ألا تقل عن 8 أحرف."); return; }
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim(), account_type: accountType }, emailRedirectTo: window.location.origin + "/my-listings" }
      });
      if (error) setMessage("تعذر إنشاء الحساب: " + error.message);
      else if (data.session) router.replace("/my-listings");
      else setMessage("تم إنشاء الحساب. افتح بريدك الإلكتروني واضغط رابط التأكيد، وبعدها سجل دخولك من هنا.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage("بيانات الدخول غير صحيحة أو الحساب لم يتم تأكيده: " + error.message);
      else {
        const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", data.user.id).maybeSingle();
        if (profile?.is_active === false) {
          await supabase.auth.signOut();
          setMessage("هذا الحساب موقوف حالياً. تواصل مع إدارة المنصة.");
        } else router.replace("/my-listings");
      }
    }
    setLoading(false);
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f3f6fa",display:"grid",placeItems:"center",padding:18,fontFamily:"Cairo,Tahoma,sans-serif"}}>
      <section style={{width:"min(490px,100%)",background:"#fff",padding:28,borderRadius:18,boxShadow:"0 15px 50px #102b4c18"}}>
        <a href="/" style={{color:"#b58c31",fontWeight:800,textDecoration:"none"}}>← العودة للموقع</a>
        <div style={{fontSize:13,color:"#b58c31",fontWeight:900,marginTop:25}}>منصة حدائق الأهرام العقارية</div>
        <h1 style={{fontSize:26,color:"#102b4d",margin:"8px 0"}}>{mode==="signup"?"إنشاء حساب جديد":"تسجيل الدخول"}</h1>
        <p style={{fontSize:12,color:"#738196",lineHeight:2}}>سجل كمالك أو وسيط عقاري لمتابعة إعلاناتك وإرسالها للمراجعة.</p>
        <div style={{display:"flex",gap:8,margin:"18px 0"}}>
          <button type="button" onClick={()=>{setMode("signup");setMessage("");}} style={{flex:1,padding:11,borderRadius:8,border:"1px solid #dce4ed",background:mode==="signup"?"#102b4d":"#fff",color:mode==="signup"?"#fff":"#52657d",fontWeight:800}}>حساب جديد</button>
          <button type="button" onClick={()=>{setMode("login");setMessage("");}} style={{flex:1,padding:11,borderRadius:8,border:"1px solid #dce4ed",background:mode==="login"?"#102b4d":"#fff",color:mode==="login"?"#fff":"#52657d",fontWeight:800}}>لدي حساب</button>
        </div>
        <form onSubmit={submit} style={{display:"grid",gap:12}}>
          {mode==="signup" && <>
            <label style={{fontSize:12,fontWeight:800,color:"#42546c"}}>الاسم بالكامل<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="اكتب اسمك" style={field}/></label>
            <label style={{fontSize:12,fontWeight:800,color:"#42546c"}}>رقم الموبايل<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01xxxxxxxxx" style={field}/></label>
            <label style={{fontSize:12,fontWeight:800,color:"#42546c"}}>نوع الحساب<select value={accountType} onChange={e=>setAccountType(e.target.value)} style={field}><option value="مالك">مالك</option><option value="وسيط عقاري">وسيط عقاري</option></select></label>
          </>}
          <label style={{fontSize:12,fontWeight:800,color:"#42546c"}}>البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" style={field}/></label>
          <label style={{fontSize:12,fontWeight:800,color:"#42546c"}}>كلمة المرور<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 أحرف على الأقل" style={field}/></label>
          <button disabled={loading} style={{height:47,border:0,borderRadius:9,background:"#102b4d",color:"#fff",fontWeight:900,cursor:"pointer"}}>{loading?"جارٍ التنفيذ...":mode==="signup"?"إنشاء الحساب":"دخول إلى حسابي"}</button>
        </form>
        {message && <p role="status" style={{marginTop:15,padding:12,borderRadius:9,background:"#f2f6fa",color:"#294663",fontSize:12,lineHeight:1.9}}>{message}</p>}
        <p style={{fontSize:11,color:"#8491a1",lineHeight:1.9,marginTop:17}}>حساب المالك أو الوسيط منفصل عن حساب إدارة المنصة.</p>
      </section>
    </main>
  );
}

const field = {display:"block",width:"100%",height:44,marginTop:6,border:"1px solid #dce4ed",borderRadius:8,padding:"0 12px",fontSize:13,boxSizing:"border-box",background:"#fff",color:"#263b52"};
