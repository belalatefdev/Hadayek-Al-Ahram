"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL="bilalatef88@gmail.com";

export default function LoginPage(){
  const [email,setEmail]=useState(ADMIN_EMAIL);
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  async function sendLink(e){
    e.preventDefault();
    if(email.trim().toLowerCase()!==ADMIN_EMAIL){setMessage("الدخول متاح حالياً لبريد المدير المعتمد فقط.");return;}
    if(!supabase){setMessage("إعدادات الاتصال غير مكتملة. راجع إعدادات الموقع.");return;}
    setLoading(true);setMessage("");
    const {error}=await supabase.auth.signInWithOtp({email:ADMIN_EMAIL,options:{emailRedirectTo:window.location.origin+"/admin"}});
    setLoading(false);
    setMessage(error?"تعذر إرسال رابط الدخول: "+error.message:"تم إرسال رابط دخول آمن إلى بريدك. افتح الرسالة واضغط الرابط للانتقال إلى لوحة الإدارة.");
  }
  return <main className="admin-login" dir="rtl">
    <style>{`
      .admin-login{min-height:100vh;padding:24px;display:grid;place-items:center;background:radial-gradient(circle at 12% 12%,#e5edf5 0,transparent 32%),linear-gradient(145deg,#f7f9fb,#edf2f7);font-family:Cairo,Tahoma,sans-serif;color:#193653}
      .admin-login-card{width:min(460px,100%);background:#fff;border:1px solid #e5ebf2;border-radius:20px;padding:34px;box-shadow:0 25px 75px #102b4d16}
      .admin-login-brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:#102b4d}.admin-login-mark{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;background:#102b4d;color:#e2bb5b;font-size:30px}.admin-login-brand b,.admin-login-brand small{display:block}.admin-login-brand b{font-size:16px}.admin-login-brand small{font-size:9px;color:#8794a2}
      .admin-login-label{display:inline-block;margin-top:31px;color:#b58c31;font-size:10px;font-weight:900}.admin-login-card h1{font-size:25px;margin:7px 0;color:#102b4d}.admin-login-card>p{font-size:11px;color:#8190a0;line-height:2;margin:0 0 20px}
      .admin-login-card label{display:block;font-size:11px;font-weight:900;color:#40556c;margin:15px 0 7px}.admin-login-card input{width:100%;height:47px;border:1px solid #dfe7ef;border-radius:9px;padding:0 13px;box-sizing:border-box;font:inherit;color:#24425f;outline:none}.admin-login-card input:focus{border-color:#c49b3d;box-shadow:0 0 0 3px #d9ad4320}
      .admin-login-card button{width:100%;height:48px;border:0;border-radius:9px;background:#102b4d;color:#fff;font:inherit;font-size:11px;font-weight:900;margin-top:16px;cursor:pointer;transition:.18s}.admin-login-card button:hover{background:#1c4a73;transform:translateY(-1px)}.admin-login-card button:disabled{opacity:.6;cursor:wait}
      .admin-login-message{margin-top:16px;padding:12px;border-radius:9px;background:#f2f6fa;color:#294663;font-size:11px;line-height:2}.admin-login-back{display:block;text-align:center;color:#a17b2d;text-decoration:none;font-size:10px;font-weight:900;margin-top:21px}
      @media(max-width:480px){.admin-login{padding:14px}.admin-login-card{padding:25px 20px;border-radius:16px}}
    `}</style>
    <section className="admin-login-card">
      <a href="/" className="admin-login-brand"><span className="admin-login-mark">⌂</span><span><b>حدائق الأهرام</b><small>إدارة المنصة العقارية</small></span></a>
      <span className="admin-login-label">منطقة آمنة للمسؤولين</span>
      <h1>تسجيل دخول الإدارة</h1>
      <p>سنرسل لك رابط دخول آمن إلى بريد المدير المعتمد. لا تحتاج إلى إدخال كلمة مرور هنا.</p>
      <form onSubmit={sendLink}><label htmlFor="admin-email">البريد الإلكتروني</label><input id="admin-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required dir="ltr"/><button disabled={loading}>{loading?"جارٍ إرسال الرابط...":"إرسال رابط الدخول الآمن"}</button></form>
      {message&&<p role="status" className="admin-login-message">{message}</p>}
      <a href="/" className="admin-login-back">← العودة إلى الموقع الرئيسي</a>
    </section>
  </main>;
}