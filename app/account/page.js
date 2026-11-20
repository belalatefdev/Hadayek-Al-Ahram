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
        email: email.trim(), password,
        options: { data: { full_name: fullName.trim(), phone: phone.trim(), account_type: accountType }, emailRedirectTo: window.location.origin + "/my-listings" }
      });
      if (error) setMessage("تعذر إنشاء الحساب: " + error.message);
      else if (data.session) router.replace("/my-listings");
      else setMessage("تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول ومتابعة إعلاناتك.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage("بيانات الدخول غير صحيحة أو الحساب لم يتم تأكيده: " + error.message);
      else {
        const { data: profile } = await supabase.from("profiles").select("is_active").eq("id", data.user.id).maybeSingle();
        if (profile?.is_active === false) { await supabase.auth.signOut(); setMessage("هذا الحساب موقوف حالياً. تواصل مع إدارة المنصة."); }
        else router.replace("/my-listings");
      }
    }
    setLoading(false);
  }

  return (
    <main className="account-page" dir="rtl">
      <style>{`
        .account-page{min-height:100vh;background:radial-gradient(circle at 8% 12%,#e8eef5 0,transparent 30%),#f4f7fa;font-family:Cairo,Tahoma,sans-serif;color:#193653;padding:28px 18px 50px}
        .account-top{width:min(1100px,100%);margin:0 auto 28px;display:flex;justify-content:space-between;align-items:center}
        .account-brand{display:flex;align-items:center;gap:11px;color:#102b4d;text-decoration:none}.account-brand-mark{width:46px;height:46px;border-radius:14px;background:#102b4d;color:#e2bb5b;display:grid;place-items:center;font-size:29px}.account-brand b,.account-brand small{display:block}.account-brand b{font-size:17px;font-weight:900}.account-brand small{font-size:10px;color:#8491a1}.account-back{color:#526b84;text-decoration:none;font-size:12px;font-weight:800}
        .account-shell{width:min(980px,100%);min-height:590px;margin:auto;display:grid;grid-template-columns: .9fr 1.1fr;background:#fff;border:1px solid #e7edf3;border-radius:23px;overflow:hidden;box-shadow:0 24px 70px #18355212}
        .account-aside{background:linear-gradient(145deg,#102b4d,#1c4a73);color:#fff;padding:42px 36px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}.account-aside:after{content:"⌂";position:absolute;font-size:260px;line-height:1;color:#ffffff09;left:-22px;bottom:-58px}.account-aside h2{font-size:29px;line-height:1.65;margin:20px 0 10px;font-weight:900;position:relative;z-index:1}.account-aside p{font-size:12px;line-height:2.1;color:#d0dce8;position:relative;z-index:1}.account-benefits{display:grid;gap:15px;position:relative;z-index:1}.account-benefit{display:flex;align-items:center;gap:11px;font-size:11px;color:#e1e9f0}.account-benefit i{width:30px;height:30px;border-radius:9px;background:#ffffff18;color:#e2bb5b;display:grid;place-items:center;font-style:normal}
        .account-form-side{padding:42px clamp(22px,5vw,55px);display:flex;flex-direction:column;justify-content:center}.account-kicker{font-size:10px;color:#b58c31;font-weight:900;letter-spacing:.3px}.account-form-side h1{font-size:27px;color:#102b4d;margin:8px 0 4px;font-weight:900}.account-desc{font-size:11px;color:#8793a2;line-height:2;margin:0 0 20px}.account-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;background:#f2f5f8;padding:5px;border-radius:11px;margin-bottom:19px}.account-switch button{border:0;border-radius:8px;padding:10px;background:transparent;color:#697b90;font-size:11px;font-weight:900;cursor:pointer}.account-switch button.active{background:#fff;color:#102b4d;box-shadow:0 2px 8px #18355212}.account-fields{display:grid;gap:13px}.account-fields label{display:grid;gap:6px;color:#42546c;font-size:11px;font-weight:800}.account-fields input,.account-fields select{width:100%;height:45px;border:1px solid #e0e7ee;border-radius:9px;padding:0 12px;background:#fff;color:#263b52;font:inherit;outline:none;transition:.2s}.account-fields input:focus,.account-fields select:focus{border-color:#c49b3d;box-shadow:0 0 0 3px #d9ad4320}.account-submit{height:48px;border:0;border-radius:9px;background:#102b4d;color:#fff;font-size:12px;font-weight:900;cursor:pointer;margin-top:4px;transition:.2s}.account-submit:hover{background:#1d4b76;transform:translateY(-1px)}.account-submit:disabled{opacity:.6;cursor:wait}.account-message{padding:11px 13px;border-radius:9px;background:#f2f6fa;color:#294663;font-size:11px;line-height:1.9;margin:14px 0 0}.account-foot{font-size:10px;color:#9aa5b1;line-height:1.9;margin-top:18px}
        @media(max-width:760px){.account-page{padding:16px 12px 35px}.account-top{margin-bottom:16px}.account-shell{grid-template-columns:1fr;min-height:0;border-radius:17px}.account-aside{padding:22px 23px;min-height:190px}.account-aside h2{font-size:21px;margin:8px 0}.account-aside p{margin:0}.account-benefits{display:none}.account-form-side{padding:27px 22px 30px}.account-form-side h1{font-size:23px}.account-brand b{font-size:15px}}
      `}</style>
      <header className="account-top">
        <a className="account-brand" href="/"><span className="account-brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>منطقتك.. عقارك.. اختيارك</small></span></a>
        <a className="account-back" href="/">العودة للموقع ←</a>
      </header>
      <section className="account-shell">
        <aside className="account-aside">
          <div><span className="account-kicker" style={{color:"#e2bb5b"}}>منصة حدائق الأهرام العقارية</span><h2>عقارك يستحق<br/>الظهور الأفضل.</h2><p>أنشئ حسابك وتابع إعلاناتك العقارية بسهولة وكن أقرب لعملائك داخل حدائق الأهرام.</p></div>
          <div className="account-benefits"><div className="account-benefit"><i>✓</i> متابعة حالة إعلاناتك لحظة بلحظة</div><div className="account-benefit"><i>⌂</i> مساحة خاصة لإدارة عقاراتك</div><div className="account-benefit"><i>↗</i> تواصل مباشر مع المهتمين</div></div>
        </aside>
        <section className="account-form-side">
          <span className="account-kicker">حساب المالك والوسيط</span>
          <h1>{mode==="signup"?"ابدأ حسابك العقاري":"أهلاً بعودتك"}</h1>
          <p className="account-desc">{mode==="signup"?"سجل بياناتك لتتمكن من إضافة العقارات ومتابعة الإعلانات.":"سجل الدخول للوصول إلى إعلاناتك وإدارة حسابك."}</p>
          <div className="account-switch"><button type="button" className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setMessage("");}}>حساب جديد</button><button type="button" className={mode==="login"?"active":""} onClick={()=>{setMode("login");setMessage("");}}>تسجيل الدخول</button></div>
          <form className="account-fields" onSubmit={submit}>
            {mode==="signup"&&<><label>الاسم بالكامل<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="اكتب اسمك بالكامل"/></label><label>رقم الموبايل<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="01xxxxxxxxx"/></label><label>نوع الحساب<select value={accountType} onChange={e=>setAccountType(e.target.value)}><option value="مالك">مالك عقار</option><option value="وسيط عقاري">وسيط عقاري</option></select></label></>}
            <label>البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" dir="ltr"/></label>
            <label>كلمة المرور<input required type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="8 أحرف على الأقل"/></label>
            <button className="account-submit" disabled={loading}>{loading?"جارٍ التنفيذ...":mode==="signup"?"إنشاء حساب جديد":"دخول إلى حسابي"}</button>
          </form>
          {message&&<p role="status" className="account-message">{message}</p>}
          <p className="account-foot">حساب المالك أو الوسيط منفصل عن حساب إدارة المنصة. بياناتك تستخدم لإدارة إعلاناتك والتواصل بشأنها.</p>
        </section>
      </section>
    </main>
  );
}
