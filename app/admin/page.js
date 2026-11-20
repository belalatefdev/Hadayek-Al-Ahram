"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "bilalatef88@gmail.com";
const statusLabels = { pending: "قيد المراجعة", published: "منشور", rejected: "مرفوض" };
const money = (n) => new Intl.NumberFormat("ar-EG").format(Number(n || 0));

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = useCallback(async () => {
    if (!supabase) { setError("إعدادات Supabase غير مكتملة."); return; }
    setRefreshing(true);
    const { data, error: queryError } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    if (queryError) setError("تعذر تحميل الإعلانات: " + queryError.message);
    else { setListings(data || []); setError(""); }
    setRefreshing(false);
  }, []);

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
      const { data, error: queryError } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (!alive) return;
      if (queryError) setError("تعذر تحميل الإعلانات: " + queryError.message);
      else setListings(data || []);
      setChecking(false);
    }
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL) router.replace("/login");
    }) || { data: { subscription: null } };
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, [router]);

  async function updateStatus(id, status) {
    setBusyId(id); setError("");
    const { error: updateError } = await supabase.from("listings").update({ status }).eq("id", id);
    if (updateError) setError("تعذر تحديث حالة الإعلان: " + updateError.message);
    else {
      setListings(current => current.map(item => item.id === id ? { ...item, status } : item));
      setSelected(current => current?.id === id ? { ...current, status } : current);
    }
    setBusyId("");
  }

  async function signOut() { await supabase?.auth.signOut(); router.replace("/login"); }

  const counts = useMemo(() => ({
    all: listings.length,
    pending: listings.filter(x => x.status === "pending").length,
    published: listings.filter(x => x.status === "published").length,
    rejected: listings.filter(x => x.status === "rejected").length,
  }), [listings]);

  const visible = useMemo(() => listings.filter(x => {
    const matchesStatus = filter === "all" || x.status === filter;
    const haystack = [x.title, x.property_type, x.gate, x.contact_name, x.phone, x.submitted_email].join(" ").toLowerCase();
    return matchesStatus && haystack.includes(search.trim().toLowerCase());
  }), [listings, filter, search]);

  const css = `
    *{box-sizing:border-box}.admin{min-height:100vh;background:#f4f6fa;color:#1b3049;font-family:Cairo,Tahoma,sans-serif;direction:rtl}
    .admin button,.admin input{font:inherit}.admin-header{background:linear-gradient(110deg,#0c2441,#19466f);color:#fff;padding:17px max(4%,calc((100% - 1220px)/2));display:flex;align-items:center;justify-content:space-between;gap:14px;box-shadow:0 5px 20px #102b4d18}
    .brand{display:flex;align-items:center;gap:12px}.brand-mark{width:43px;height:43px;border-radius:13px;background:#ffffff19;color:#e2bb5b;display:grid;place-items:center;font-size:29px}.brand b{font-size:18px;display:block}.brand small{font-size:10px;color:#c4d2e0}
    .header-actions{display:flex;align-items:center;gap:10px}.header-actions a,.header-actions button{border:1px solid #ffffff50;background:#ffffff12;color:#fff;text-decoration:none;border-radius:8px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer}
    .admin-main{width:min(1220px,92%);margin:30px auto 65px}.welcome{display:flex;align-items:end;justify-content:space-between;gap:15px;margin-bottom:22px}.welcome h1{font-size:27px;margin:3px 0;color:#102b4d}.welcome p{font-size:11px;color:#8290a1;margin:0}.welcome .date{font-size:11px;color:#7d8b9c}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:22px}.stat{background:#fff;border:1px solid #e7ecf2;border-radius:13px;padding:17px;display:flex;align-items:center;gap:12px}.stat-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-size:20px;background:#edf3f8;color:#244d75}.stat small{display:block;color:#8491a1;font-size:10px}.stat strong{font-size:24px;color:#173653}
    .toolbar{background:#fff;border:1px solid #e7ecf2;border-radius:13px;padding:15px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.filters{display:flex;gap:7px;flex-wrap:wrap}.filters button{border:1px solid #e3e9ef;background:#fff;color:#627286;border-radius:8px;padding:8px 12px;font-size:10px;font-weight:800;cursor:pointer}.filters button.active{background:#102b4d;border-color:#102b4d;color:#fff}.search{height:38px;min-width:220px;border:1px solid #e3e9ef;border-radius:8px;padding:0 11px;font-size:11px;outline:none}
    .table-panel{background:#fff;border:1px solid #e7ecf2;border-radius:13px;overflow:hidden}.panel-head{padding:17px 19px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #edf0f4}.panel-head h2{font-size:15px;margin:0;color:#173653}.panel-head span{font-size:10px;color:#8a97a6}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;min-width:820px}th{text-align:right;background:#f9fafc;color:#7c8998;font-size:10px;font-weight:800;padding:13px 15px}td{padding:13px 15px;border-top:1px solid #f0f2f5;font-size:11px;color:#40546b;vertical-align:middle}.property-cell{display:flex;align-items:center;gap:10px;min-width:210px}.thumb{width:55px;height:48px;border-radius:8px;object-fit:cover;background:#edf1f5}.property-cell b{display:block;color:#193653;font-size:11px;max-width:220px}.property-cell small{color:#929eac;font-size:9px}.status{display:inline-block;border-radius:20px;padding:5px 9px;font-size:9px;font-weight:900;white-space:nowrap}.status.pending{background:#fff5df;color:#a2761f}.status.published{background:#e8f6ef;color:#18764e}.status.rejected{background:#fceeee;color:#a63d3d}.actions{display:flex;gap:5px;white-space:nowrap}.actions button{border:0;border-radius:7px;padding:7px 9px;font-size:9px;font-weight:900;cursor:pointer}.view{background:#edf3f8;color:#244d75}.approve{background:#168254;color:#fff}.reject{background:#f8eaea;color:#a33e3e}.muted-btn{background:#fff4dc;color:#8d681e}.empty{padding:38px 15px;text-align:center;color:#8a97a6;font-size:12px}.notice{background:#fff6e7;border:1px solid #f0dfbd;color:#8b6827;padding:12px 15px;border-radius:9px;font-size:11px;line-height:1.8;margin:12px 0}
    .modal-shade{position:fixed;inset:0;z-index:40;background:#081a2dcc;display:grid;place-items:center;padding:15px}.detail-modal{background:#fff;border-radius:16px;width:min(720px,100%);max-height:92vh;overflow:auto;padding:23px;position:relative}.close{position:absolute;left:15px;top:13px;border:0;border-radius:50%;width:32px;height:32px;background:#f0f3f6;font-size:20px;cursor:pointer}.detail-modal h2{font-size:19px;color:#102b4d;margin:0 35px 5px 0}.modal-sub{font-size:11px;color:#8592a1;margin:0 0 16px}.gallery{display:flex;gap:8px;overflow:auto;margin-bottom:17px}.gallery img{width:150px;height:115px;object-fit:cover;border-radius:9px;background:#eef1f4}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.detail-item{background:#f5f7fa;padding:10px;border-radius:8px}.detail-item small{display:block;color:#8a97a6;font-size:9px}.detail-item b{font-size:11px;color:#29435e;word-break:break-word}.description{white-space:pre-line;font-size:11px;line-height:2;color:#63748a;margin-top:14px}.modal-actions{display:flex;gap:8px;margin-top:17px;flex-wrap:wrap}.modal-actions button,.modal-actions a{border:0;border-radius:8px;padding:10px 14px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}
    @media(max-width:760px){.admin-header{padding:13px 4%}.brand b{font-size:15px}.header-actions a{display:none}.admin-main{width:94%;margin-top:22px}.welcome{align-items:start;flex-direction:column}.welcome h1{font-size:22px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stat{padding:12px;gap:8px}.stat-icon{width:35px;height:35px}.stat strong{font-size:20px}.toolbar{align-items:stretch;flex-direction:column}.search{width:100%;min-width:0}.panel-head{padding:14px}.detail-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:390px){.header-actions button{padding:8px}.brand small{font-size:8px}.detail-grid{grid-template-columns:1fr}}
  `;

  return (
    <main className="admin" dir="rtl">
      <style>{css}</style>
      <header className="admin-header">
        <div className="brand"><span className="brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>لوحة تحكم المدير</small></span></div>
        <div className="header-actions"><a href="/" target="_blank">عرض الموقع ↗</a><button onClick={signOut}>تسجيل الخروج</button></div>
      </header>
      <section className="admin-main">
        {checking ? <p>جارٍ التحقق من حساب المدير...</p> : <>
          <div className="welcome"><div><span style={{color:"#b58c31",fontSize:10,fontWeight:900}}>مرحباً بعودتك</span><h1>إدارة الإعلانات العقارية</h1><p>تابع الإعلانات وراجع بياناتها قبل ظهورها للزوار.</p></div><span className="date">{email}</span></div>
          <div className="stats">
            <div className="stat"><span className="stat-icon">▤</span><div><small>إجمالي الإعلانات</small><strong>{counts.all}</strong></div></div>
            <div className="stat"><span className="stat-icon" style={{background:"#fff5df",color:"#a2761f"}}>◷</span><div><small>قيد المراجعة</small><strong>{counts.pending}</strong></div></div>
            <div className="stat"><span className="stat-icon" style={{background:"#e8f6ef",color:"#18764e"}}>✓</span><div><small>منشور على الموقع</small><strong>{counts.published}</strong></div></div>
            <div className="stat"><span className="stat-icon" style={{background:"#fceeee",color:"#a63d3d"}}>×</span><div><small>مرفوض</small><strong>{counts.rejected}</strong></div></div>
          </div>
          <div className="toolbar">
            <div className="filters">
              {[["all","الكل"],["pending","قيد المراجعة"],["published","منشور"],["rejected","مرفوض"]].map(([key,label])=><button key={key} className={filter===key?"active":""} onClick={()=>setFilter(key)}>{label} ({counts[key]})</button>)}
            </div>
            <input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالعنوان أو البوابة أو رقم الهاتف..."/>
          </div>
          {error && <div className="notice">{error}</div>}
          <div className="table-panel">
            <div className="panel-head"><h2>قائمة الإعلانات</h2><span>{visible.length} نتيجة · <button onClick={loadListings} disabled={refreshing} style={{border:0,background:"none",color:"#24527d",fontWeight:900,cursor:"pointer"}}>{refreshing?"جارٍ التحديث...":"تحديث ↻"}</button></span></div>
            {visible.length===0 ? <div className="empty">{listings.length===0?"لا توجد إعلانات محفوظة حتى الآن.":"لا توجد نتائج مطابقة للبحث."}</div> :
              <div className="table-scroll"><table><thead><tr><th>العقار</th><th>السعر</th><th>المعلن</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>
                {visible.map(item=><tr key={item.id}>
                  <td><div className="property-cell"><img className="thumb" src={item.image_urls?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=160&q=70"} alt=""/><div><b>{item.title || item.property_type}</b><small>{item.gate || "حدائق الأهرام"} · {item.property_type || "عقار"}</small></div></div></td>
                  <td>{money(item.price)} ج.م</td><td>{item.contact_name || "—"}<br/><small>{item.phone || ""}</small></td>
                  <td><span className={"status "+item.status}>{statusLabels[item.status] || item.status}</span></td>
                  <td>{item.created_at?new Date(item.created_at).toLocaleDateString("ar-EG"):"—"}</td>
                  <td><div className="actions"><button className="view" onClick={()=>setSelected(item)}>عرض</button>{item.status!=="published" && <button className="approve" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"published")}>{busyId===item.id?"...":"نشر"}</button>}{item.status!=="rejected" && <button className="reject" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"rejected")}>رفض</button>}{item.status==="rejected" && <button className="muted-btn" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"pending")}>إعادة للمراجعة</button>}</div></td>
                </tr>)}
              </tbody></table></div>}
          </div>
        </>}
      </section>
      {selected && <div className="modal-shade" onClick={()=>setSelected(null)}><section className="detail-modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelected(null)}>×</button>
        <h2>{selected.title || selected.property_type}</h2><p className="modal-sub">{selected.gate || "حدائق الأهرام"} · {statusLabels[selected.status]}</p>
        {selected.image_urls?.length>0 && <div className="gallery">{selected.image_urls.map((url,i)=><img src={url} alt={"صورة العقار "+(i+1)} key={url}/>)}</div>}
        <div className="detail-grid">
          {[["نوع العملية",selected.deal_type],["نوع العقار",selected.property_type],["السعر",money(selected.price)+" جنيه"],["المساحة",selected.area?money(selected.area)+" م²":"—"],["اسم المعلن",selected.contact_name],["رقم الهاتف",selected.phone],["البريد",selected.submitted_email],["تاريخ الإضافة",selected.created_at?new Date(selected.created_at).toLocaleString("ar-EG"):"—"]].map(([label,value])=><div className="detail-item" key={label}><small>{label}</small><b>{value || "—"}</b></div>)}
        </div>
        <p className="description">{selected.description || "لا يوجد وصف إضافي."}</p>
        <div className="modal-actions">{selected.phone && <a href={"tel:"+selected.phone} style={{background:"#edf3f8",color:"#244d75"}}>اتصال بالمعلن</a>}{selected.status!=="published" && <button style={{background:"#168254",color:"#fff"}} disabled={busyId===selected.id} onClick={()=>updateStatus(selected.id,"published")}>اعتماد ونشر</button>}{selected.status!=="rejected" && <button style={{background:"#f8eaea",color:"#a33e3e"}} disabled={busyId===selected.id} onClick={()=>updateStatus(selected.id,"rejected")}>رفض الإعلان</button>}</div>
      </section></div>}
    </main>
  );
}
