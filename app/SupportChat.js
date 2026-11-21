"use client";

import { useState } from "react";

const initialMessage = { role: "assistant", content: "أهلاً بيك 👋 أنا مساعد حدائق الأهرام. أقدر أساعدك في التسجيل، إضافة إعلان، رفع الصور أو استخدام الموقع. تحب أساعدك في إيه؟" };

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(text) {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/support-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر الحصول على رد");
      setMessages((old) => [...old, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e.message || "حصلت مشكلة. حاول تاني.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="support-chat-root" dir="rtl">
      {open && <section className="support-chat-panel" aria-label="مساعد حدائق الأهرام">
        <header className="support-chat-header">
          <div className="support-chat-avatar">✦</div>
          <div><strong>مساعد حدائق الأهرام</strong><small><i /> دعم الموقع الإلكتروني</small></div>
          <button type="button" aria-label="إغلاق المحادثة" onClick={() => setOpen(false)}>×</button>
        </header>
        <div className="support-chat-messages" aria-live="polite">
          {messages.map((m, i) => <div key={i} className={m.role === "user" ? "support-message user" : "support-message bot"}>{m.content}</div>)}
          {busy && <div className="support-message bot typing">بيكتب رد...</div>}
        </div>
        {!busy && messages.length === 1 && <div className="support-chat-suggestions">
          {["إزاي أضيف إعلان؟", "مش عارف أسجل دخول", "إزاي أتابع إعلاني؟"].map(s => <button type="button" key={s} onClick={() => sendMessage(s)}>{s}</button>)}
        </div>}
        {error && <p className="support-chat-error">{error}</p>}
        <form className="support-chat-form" onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="اكتب رسالتك هنا..." aria-label="رسالتك" disabled={busy} maxLength={1500} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="إرسال">➤</button>
        </form>
        <div className="support-chat-foot">مساعد آلي — لا ترسل كلمات المرور أو رموز الدخول</div>
      </section>}
      <button className={open ? "support-chat-launch open" : "support-chat-launch"} type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? "إغلاق مساعد الدعم" : "فتح مساعد الدعم"}>
        {open ? "×" : <><span className="support-chat-icon">✦</span><span>الدعم الفني</span></>}
      </button>
    </div>
  );
}
