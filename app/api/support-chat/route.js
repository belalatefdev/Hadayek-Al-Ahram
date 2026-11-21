import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `أنت مساعد الدعم الفني لموقع "حدائق الأهرام" العقاري فقط. تحدث بالعربية المصرية ببساطة وود.
ساعد المستخدمين في التسجيل وتسجيل الدخول وإضافة الإعلانات ورفع الصور ومتابعة إعلانهم وشرح استخدام الموقع.
لا تدّع أنك نفذت أي إجراء داخل حساب المستخدم أو أنك تستطيع الاطلاع على بياناته أو حالة الإعلان.
محرك البحث العقاري مستقل عنك: لا تبحث عن العقارات ولا تختلق أسعارًا أو إعلانات.
إذا كانت المشكلة تحتاج تدخل الإدارة، وجّه المستخدم للتواصل عبر bilalatef88@gmail.com.
لا تطلب كلمات مرور أو رموز دخول أو بيانات دفع. الأسئلة خارج دعم الموقع أجب باختصار أنك متخصص في مساعدة مستخدمي منصة حدائق الأهرام.`;

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "مساعد الدعم غير متاح حاليًا. يمكنك التواصل مع الدعم الفني عبر bilalatef88@gmail.com." }, { status: 503 });
    }
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
    const safeMessages = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "اكتب سؤالك أولًا." }, { status: 400 });
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.4,
        max_tokens: 450,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
      }),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "حصلت مشكلة مؤقتة في رد المساعد. حاول تاني بعد شوية." }, { status: 502 });
    }
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json({ error: "لم يصل رد. حاول مرة أخرى." }, { status: 502 });
    return NextResponse.json({ reply: answer });
  } catch {
    return NextResponse.json({ error: "حصل خطأ غير متوقع. حاول مرة أخرى." }, { status: 500 });
  }
}
