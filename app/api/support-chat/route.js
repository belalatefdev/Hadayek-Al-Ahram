import { NextResponse } from "next/server";


function fallbackReply(question) {
  const q = String(question || "").toLowerCase();
  if (/اضاف|نشر|اعلان|إعلان|بيع|إيجار/.test(q)) return "لإضافة إعلان: سجّل الدخول من «حسابي»، ثم اضغط «أضف عقارك». أكمل بيانات العقار (نوع العملية، النوع، البوابة، المساحة، السعر، المواصفات، التواصل والصور) ثم أرسل الإعلان للمراجعة. الإعلانات تظهر بعد اعتمادها.";
  if /تسجيل|دخول|حساب|كلمة.?السر|password|login|رمز|تحقق/.test(q) return "للتسجيل أو الدخول: افتح «حسابي» واختار إنشاء حساب أو تسجيل الدخول. راجع بريدك وصندوق Spam لو رسالة التحقق اتأخرت، وتجنب مشاركة كلمة المرور أو رمز التحقق هنا.";
  if (/صور|صورة|رفع|upload/.test(q)) return "في نموذج الإعلان، أضف الصور من جهازك في خطوة الصور. استخدم صور واضحة للعقار، وانتظر اكتمال الرفع قبل إرسال الإعلان.";
  if /بحث|فلتر|مساحة|سعر|بوابة|المنطقة|غرف|حمام/.test(q) return "استخدم صندوق البحث أعلى الصفحة لتحديد بيع أو إيجار، نوع العقار، البوابة، السعر، المساحة وعدد غرف النوم، ثم اضغط «اعرض النتائج». زر «مسح الفلاتر» يعيد البحث للوضع الافتراضي.";
  if /متابع|حالة|اعلانى|إعلاني|إعلاناتى|إعلاناتي|موافقة|مراجعة/.test(q) return "لمتابعة إعلانك، سجّل الدخول إلى «حسابي» ثم افتح قسم إعلاناتك لمراجعة الحالة. الإعلانات الجديدة قد تحتاج مراجعة قبل نشرها.";
  if /واتساب|اتصل|تواصل|مالك|رقم/.test(q) return "افتح صفحة تفاصيل العقار واستخدم وسيلة التواصل المعروضة هناك، إذا كانت متاحة. لا ترسل كلمات المرور أو بيانات حساسة في الشات.";
  if /خريطة|map/.test(q) return "قسم الخريطة بالموقع يعرض معلومات عن منطقة حدائق الأهرام. لو الخريطة لا تظهر أو تحتاج اتجاهات، افتح Google Maps وابحث عن «حدائق الأهرام».";
  if /شكرا|شكرًا|thanks/.test(q) return "العفو! 😊 لو احتجت مساعدة في البحث أو إضافة إعلان، أنا معاك.";
  return "وصلني سؤالك، لكن خدمة الذكاء الاصطناعي غير مفعّلة أو تواجه مشكلة مؤقتة. أقدر أساعدك حاليًا في التسجيل، إضافة الإعلان، الصور، البحث، والمتابعة. للدعم المباشر: bilalatef88@gmail.com";
}

const SYSTEM_PROMPT = `أنت مساعد ذكاء اصطناعي ودود ومفيد داخل موقع "حدائق الأهرام". يمكنك مساعدة المستخدم في أي موضوع عام بشكل مناسب: شرح، كتابة، ترجمة، أفكار، معلومات، أسئلة تقنية بسيطة، ونصائح عامة. افهم السؤال أولًا وأجب مباشرة وبوضوح، وكن مرنًا في اللغة؛ استخدم العربية المصرية بشكل طبيعي إذا كان المستخدم يتحدث بها، أو لغة المستخدم إذا كتب بلغة أخرى.

أنت أيضًا خبير في مساعدة زوار الموقع: التسجيل والدخول، إضافة إعلان عقاري، الصور، تعديل الإعلان، متابعة حالة الإعلان، الحساب، واستخدام البحث والفلاتر. لا تخلط بين محادثتك وبين محرك البحث العقاري: لا تدّع أنك بحثت في الإعلانات أو شاهدت بيانات مباشرة ما لم تكن متاحة لك فعلًا، ولا تختلق عقارات أو أسعارًا أو حالة إعلان.

إذا لم تكن متأكدًا من معلومة، اذكر عدم التأكد بوضوح وقدم طريقة للتحقق. لا تدّع تنفيذ إجراءات أو الوصول إلى حسابات أو بيانات خاصة. لا تطلب كلمات مرور أو رموز تسجيل دخول أو بيانات دفع. في مشاكل الموقع التي تحتاج تدخل الإدارة، وجّه المستخدم إلى البريد: bilalatef88@gmail.com.

أجب عن الأسئلة العامة ولا ترفضها لمجرد أنها خارج نطاق الموقع. التزم بالسلامة والقانون، وقدم إجابات عملية ومختصرة ما لم يطلب المستخدم تفاصيل أكثر.`;

const MAX_REQUEST_BYTES = 24000;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const RATE_LIMIT_MAX_KEYS = 1000;
// Best-effort per-instance limit; production-wide limits should use a shared store.
const rateLimitStore = globalThis.__hadayekSupportRateLimit || (globalThis.__hadayekSupportRateLimit = new Map());

function rateLimit(request) {
  const key = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now - entry.start >= RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(ip);
  }
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.start >= RATE_LIMIT_WINDOW_MS) {
    if (rateLimitStore.size >= RATE_LIMIT_MAX_KEYS) {
      const oldestKey = rateLimitStore.keys().next().value;
      if (oldestKey !== undefined) rateLimitStore.delete(oldestKey);
    }
    rateLimitStore.set(key, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(request) {
  try {
    if (!rateLimit(request)) {
      return NextResponse.json({ error: "طلبات كثيرة خلال وقت قصير. انتظر دقيقة وحاول مرة أخرى." }, { status: 429 });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "المحادثة طويلة جدًا. قلل الرسائل وحاول مرة أخرى." }, { status: 413 });
    }
    let rawBody = "";
    if (request.body) {
      const reader = request.body.getReader();
      const chunks = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > MAX_REQUEST_BYTES) {
          await reader.cancel();
          return NextResponse.json({ error: "المحادثة طويلة جدًا. قلل الرسائل وحاول مرة أخرى." }, { status: 413 });
        }
        chunks.push(value);
      }
      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
      rawBody = new TextDecoder().decode(merged);
    }
    let body;
    try { body = JSON.parse(rawBody); } catch {
      return NextResponse.json({ error: "البيانات المرسلة غير صحيحة." }, { status: 400 });
    }
    if (!Array.isArray(body?.messages) || body.messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: "عدد الرسائل غير صالح. حاول إرسال آخر سؤال فقط." }, { status: 400 });
    }
    const messages = body.messages.slice(-MAX_MESSAGES);
    const safeMessages = messages
      .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "اكتب سؤالك أولًا." }, { status: 400 });
    }
    // Local fallback keeps support usable when AI credentials or API service fail.
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackReply(safeMessages[safeMessages.length - 1].content), mode: "help-fallback" });
    }
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.4,
        max_tokens: 450,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...safeMessages],
      }),
    });
    if (!response.ok) {
      return NextResponse.json({ reply: fallbackReply(safeMessages[safeMessages.length - 1].content), mode: "help-fallback" });
    }
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json({ error: "لم يصل رد. حاول مرة أخرى." }, { status: 502 });
    return NextResponse.json({ reply: answer });
  } catch {
    return NextResponse.json({ error: "حصل خطأ غير متوقع. حاول مرة أخرى." }, { status: 500 });
  }
}
