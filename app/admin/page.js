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
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [profileError, setProfileError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileBusyId, setProfileBusyId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const unreadNotifications = notifications.filter(item => !item.is_read).length;

  const loadNotifications = useCallback(async () => {
    if (!supabase) return;
    const { data, error: notificationError } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(40);
    if (!notificationError) setNotifications(data || []);
  }, []);

  async function markNotificationRead(item) {
    if (!item.is_read) {
      setNotificationBusy(true);
      const { error: updateError } = await supabase.from("admin_notifications").update({ is_read: true }).eq("id", item.id);
      if (!updateError) setNotifications(current => current.map(row => row.id === item.id ? { ...row, is_read: true } : row));
      setNotificationBusy(false);
    }
    setActiveTab(item.type === "new_account" ? "accounts" : "listings");
    if (item.type === "new_listing") setFilter("pending");
    setNotificationOpen(false);
  }

  async function markAllNotificationsRead() {
    const unreadIds = notifications.filter(item => !item.is_read).map(item => item.id);
    if (!unreadIds.length) return;
    setNotificationBusy(true);
    const { error: updateError } = await supabase.from("admin_notifications").update({ is_read: true }).in("id", unreadIds);
    if (!updateError) setNotifications(current => current.map(item => ({ ...item, is_read: true })));
    setNotificationBusy(false);
  }

  const loadProfiles = useCallback(async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from("profiles").select("id,full_name,phone,account_type,email,created_at,is_active").order("created_at", { ascending: false });
    if (queryError) setProfileError("تعذر تحميل الحسابات: " + queryError.message);
    else { setProfiles(data || []); setProfileError(""); }
  }, []);

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
      const { data: profileRows, error: profileQueryError } = await supabase.from("profiles").select("id,full_name,phone,account_type,email,created_at,is_active").order("created_at", { ascending: false });
      const { data: notificationRows } = await supabase.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(40);
      if (notificationRows) setNotifications(notificationRows);
      if (profileQueryError) setProfileError("تعذر تحميل الحسابات: " + profileQueryError.message);
      else setProfiles(profileRows || []);
      setChecking(false);
    }
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session || session.user.email?.toLowerCase() !== ADMIN_EMAIL) router.replace("/login");
    }) || { data: { subscription: null } };
    const notificationTimer = setInterval(() => { loadNotifications(); }, 30000);
    return () => { alive = false; clearInterval(notificationTimer); listener?.subscription?.unsubscribe(); };
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

  async function toggleProfileActivation(profile) {
    const nextActive = profile.is_active === false;
    const confirmed = window.confirm(nextActive ? "هل تريد إعادة تفعيل هذا الحساب؟" : "هل تريد إيقاف هذا الحساب من استخدام المنصة؟");
    if (!confirmed) return;
    setProfileBusyId(profile.id);
    const { error: updateError } = await supabase.from("profiles").update({ is_active: nextActive }).eq("id", profile.id);
    if (updateError) setProfileError("تعذر تغيير حالة الحساب: " + updateError.message);
    else {
      setProfiles(current => current.map(item => item.id === profile.id ? { ...item, is_active: nextActive } : item));
      setSelectedProfile(current => current?.id === profile.id ? { ...current, is_active: nextActive } : current);
      setProfileError("");
    }
    setProfileBusyId("");
  }

  async function signOut() { await supabase?.auth.signOut(); router.replace("/login"); }

  const counts = useMemo(() => ({
    all: listings.length,
    pending: listings.filter(x => x.status === "pending").length,
    published: listings.filter(x => x.status === "published").length,
    rejected: listings.filter(x => x.status === "rejected").length,
  }), [listings]);

  const profileCounts = useMemo(() => {
    const counts = {};
    listings.forEach(item => { if (item.submitted_by) counts[item.submitted_by] = (counts[item.submitted_by] || 0) + 1; });
    return counts;
  }, [listings]);

  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = listings.filter(item => {
      if (!item.created_at) return false;
      const d = new Date(item.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const avgPriceItems = listings.filter(item => item.price && item.deal_type !== "إيجار");
    const averagePrice = avgPriceItems.length ? Math.round(avgPriceItems.reduce((sum,item)=>sum+Number(item.price||0),0)/avgPriceItems.length) : 0;
    const activeProfiles = profiles.filter(profile=>profile.is_active!==false).length;
    return {thisMonth, averagePrice, activeProfiles};
  }, [listings, profiles]);
\n  const visibleProfiles = useMemo(() => profiles.filter(profile => {
    const haystack = [profile.full_name, profile.phone, profile.account_type, profile.email].join(" ").toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  }), [profiles, search]);

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

    .header-actions{position:relative}.notification-wrap{position:relative}.notification-button{position:relative;border:1px solid #ffffff50;background:#ffffff12;color:#fff;border-radius:9px;padding:9px 12px;font-size:12px;cursor:pointer}.notification-count{position:absolute;top:-7px;left:-7px;min-width:19px;height:19px;border-radius:20px;background:#e3b84e;color:#102b4d;display:grid;place-items:center;font-size:10px;font-weight:900;padding:0 4px}.notification-popover{position:absolute;top:48px;left:0;width:min(360px,88vw);background:#fff;color:#193653;border:1px solid #e6ebf1;border-radius:13px;box-shadow:0 18px 55px #07182d35;z-index:50;overflow:hidden}.notification-head{display:flex;justify-content:space-between;align-items:center;padding:13px 15px;border-bottom:1px solid #edf0f4}.notification-head b{font-size:12px}.notification-head button{border:0;background:none;color:#a27a26;font-size:10px;font-weight:900;cursor:pointer}.notification-list{max-height:360px;overflow:auto}.notification-item{display:flex;width:100%;text-align:right;gap:10px;padding:12px 14px;border:0;border-bottom:1px solid #f0f2f5;background:#fff;cursor:pointer}.notification-item:hover{background:#f7f9fb}.notification-item.unread{background:#fffaf0}.notification-dot{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:#d9ad43;margin-top:5px}.notification-item b{display:block;font-size:11px;color:#1b3552}.notification-item small{display:block;font-size:10px;color:#8491a1;line-height:1.7;margin-top:3px}.notification-empty{padding:25px;text-align:center;color:#8a97a6;font-size:11px}
    .admin-tabs{display:flex;gap:8px;margin:0 0 15px}.admin-tabs button{border:1px solid #e3e9ef;background:#fff;color:#52667c;border-radius:9px;padding:10px 16px;font-size:11px;font-weight:900;cursor:pointer}.admin-tabs button.active{background:#102b4d;color:#fff;border-color:#102b4d}.account-type{display:inline-block;background:#edf3f8;color:#244d75;padding:5px 9px;border-radius:20px;font-size:10px;font-weight:900}.profile-id{font-size:9px;color:#98a3af;direction:ltr;display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis}.account-actions{display:flex;gap:6px;white-space:nowrap}.account-actions button{border:0;border-radius:7px;padding:7px 9px;font-size:9px;font-weight:900;cursor:pointer}.account-active{background:#e8f6ef;color:#18764e}.account-disabled{background:#fceeee;color:#a33e3e}.modal-shade{position:fixed;inset:0;z-index:40;background:#081a2dcc;display:grid;place-items:center;padding:15px}.detail-modal{background:#fff;border-radius:16px;width:min(720px,100%);max-height:92vh;overflow:auto;padding:23px;position:relative}.close{position:absolute;left:15px;top:13px;border:0;border-radius:50%;width:32px;height:32px;background:#f0f3f6;font-size:20px;cursor:pointer}.detail-modal h2{font-size:19px;color:#102b4d;margin:0 35px 5px 0}.modal-sub{font-size:11px;color:#8592a1;margin:0 0 16px}.gallery{display:flex;gap:8px;overflow:auto;margin-bottom:17px}.gallery img{width:150px;height:115px;object-fit:cover;border-radius:9px;background:#eef1f4}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.detail-item{background:#f5f7fa;padding:10px;border-radius:8px}.detail-item small{display:block;color:#8a97a6;font-size:9px}.detail-item b{font-size:11px;color:#29435e;word-break:break-word}.description{white-space:pre-line;font-size:11px;line-height:2;color:#63748a;margin-top:14px}.modal-actions{display:flex;gap:8px;margin-top:17px;flex-wrap:wrap}.modal-actions button,.modal-actions a{border:0;border-radius:8px;padding:10px 14px;font-size:11px;font-weight:900;text-decoration:none;cursor:pointer}
    @media(max-width:760px){.admin-header{padding:13px 4%}.brand b{font-size:15px}.header-actions a{display:none}.admin-main{width:94%;margin-top:22px}.welcome{align-items:start;flex-direction:column}.welcome h1{font-size:22px}.stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stat{padding:12px;gap:8px}.stat-icon{width:35px;height:35px}.stat strong{font-size:20px}.toolbar{align-items:stretch;flex-direction:column}.search{width:100%;min-width:0}.panel-head{padding:14px}.detail-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:390px){.header-actions button{padding:8px}.brand small{font-size:8px}.detail-grid{grid-template-columns:1fr}}

    .admin{background:linear-gradient(180deg,#f1f5f9 0,#f7f9fb 260px,#f5f7fa 100%)}
    .admin-header{min-height:76px;background:linear-gradient(110deg,#0b2340,#17436d);padding-top:15px;padding-bottom:15px}
    .brand-mark{box-shadow:inset 0 0 0 1px #e2bb5b35}.admin-main{margin-top:34px}
    .welcome{background:#fff;border:1px solid #e7edf3;border-radius:16px;padding:20px 23px;box-shadow:0 7px 24px #18355208}
    .welcome h1{letter-spacing:-.4px}.stats{gap:15px}.stat{border-radius:15px;box-shadow:0 5px 18px #18355206;transition:transform .18s,box-shadow .18s}.stat:hover{transform:translateY(-2px);box-shadow:0 10px 24px #18355210}
.analytics-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}.analytics-card{background:#fff;border:1px solid #e7ecf2;border-radius:13px;padding:16px}.analytics-card small{display:block;font-size:10px;color:#8794a3}.analytics-card strong{display:block;font-size:22px;color:#173653;margin-top:5px}.analytics-panel{background:#fff;border:1px solid #e7ecf2;border-radius:13px;padding:18px;margin-bottom:14px}.analytics-panel h3{margin:0 0 16px;font-size:14px;color:#173653}.analytics-bar-row{display:grid;grid-template-columns:100px 1fr 40px;align-items:center;gap:9px;margin:12px 0;font-size:10px;color:#65768a}.analytics-track{height:12px;background:#f0f3f6;border-radius:12px;overflow:hidden}.analytics-fill{height:100%;border-radius:12px}.analytics-fill.pending{background:#d5a73f}.analytics-fill.published{background:#2c9965}.analytics-fill.rejected{background:#c95b5b}@media(max-width:760px){.analytics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.analytics-panel{padding:14px}.analytics-bar-row{grid-template-columns:80px 1fr 32px;gap:6px}}\n    .admin-tabs button{padding:11px 17px;border-radius:10px;transition:.18s}.admin-tabs button.active{box-shadow:0 5px 14px #102b4d20}
    .toolbar,.table-panel{border-radius:15px;box-shadow:0 5px 20px #18355206}.toolbar{padding:16px}.search:focus{border-color:#c49b3d;outline:none;box-shadow:0 0 0 3px #d9ad4320}
    .table-panel{overflow:hidden}.panel-head{padding:18px 20px}.table-scroll table{min-width:850px}th{background:#f6f8fb}tbody tr{transition:background .15s}tbody tr:hover{background:#fbfcfd}td{padding-top:15px;padding-bottom:15px}
    .thumb{border:1px solid #e8edf2}.actions button,.account-actions button{transition:transform .15s,filter .15s}.actions button:hover,.account-actions button:hover{transform:translateY(-1px);filter:brightness(.97)}
    .detail-modal{border:1px solid #e7edf3;box-shadow:0 25px 80px #06172c55;border-radius:18px}
    @media(max-width:760px){.admin-main{margin-top:20px}.welcome{padding:17px}.stats{gap:8px}.stat{border-radius:12px}.header-actions{gap:6px}.notification-button{padding:8px 9px;font-size:10px}.notification-popover{left:-48px}}
  `;

  return (
    <main className="admin" dir="rtl">
      <style>{css}</style>
      <header className="admin-header">
        <div className="brand"><span className="brand-mark">⌂</span><span><b>حدائق الأهرام</b><small>لوحة تحكم المدير</small></span></div>
        <div className="header-actions">
          <div className="notification-wrap">
            <button className="notification-button" onClick={()=>setNotificationOpen(open=>!open)} aria-label="الإشعارات">🔔 الإشعارات{unreadNotifications>0&&<span className="notification-count">{unreadNotifications>99?"99+":unreadNotifications}</span>}</button>
            {notificationOpen&&<div className="notification-popover">
              <div className="notification-head"><b>الإشعارات والتنبيهات</b><button disabled={notificationBusy||unreadNotifications===0} onClick={markAllNotificationsRead}>قراءة الكل</button></div>
              <div className="notification-list">{notifications.length===0?<div className="notification-empty">لا توجد إشعارات حتى الآن.</div>:notifications.map(item=><button key={item.id} className={"notification-item "+(!item.is_read?"unread":"")} onClick={()=>markNotificationRead(item)}><span className="notification-dot" style={{opacity:item.is_read?0.2:1}}/><span><b>{item.title}</b><small>{item.message}</small><small>{new Date(item.created_at).toLocaleString("ar-EG")}</small></span></button>)}</div>
            </div>}
          </div>
          <a href="/" target="_blank">عرض الموقع ↗</a><button onClick={signOut}>تسجيل الخروج</button>
        </div>
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
          <div className="admin-tabs">
            <button className={activeTab==="listings"?"active":""} onClick={()=>setActiveTab("listings")}>إدارة الإعلانات ({listings.length})</button>
            <button className={activeTab==="analytics"?"active":""} onClick={()=>setActiveTab("analytics")}>الإحصائيات</button>\n            <button className={activeTab==="accounts"?"active":""} onClick={()=>{setActiveTab("accounts");if(!profiles.length)loadProfiles();}}>إدارة الحسابات ({profiles.length})</button>
          </div>
          <div className="toolbar">
            <div className="filters">
              {[["all","الكل"],["pending","قيد المراجعة"],["published","منشور"],["rejected","مرفوض"]].map(([key,label])=><button key={key} className={filter===key?"active":""} onClick={()=>setFilter(key)}>{label} ({counts[key]})</button>)}
            </div>
            <input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالعنوان أو البوابة أو رقم الهاتف..."/>
          </div>
          {error && <div className="notice">{error}</div>}
          {activeTab==="analytics" ? <><div className="analytics-grid">
            <div className="analytics-card"><small>إعلانات هذا الشهر</small><strong>{analytics.thisMonth}</strong></div>
            <div className="analytics-card"><small>حسابات نشطة</small><strong>{analytics.activeProfiles}</strong></div>
            <div className="analytics-card"><small>متوسط سعر البيع</small><strong>{money(analytics.averagePrice)} ج.م</strong></div>
          </div><div className="analytics-panel"><h3>توزيع حالات الإعلانات</h3>
            {[[ "pending","قيد المراجعة",counts.pending],["published","منشور",counts.published],["rejected","مرفوض",counts.rejected]].map(([key,label,value])=><div className="analytics-bar-row" key={key}><span>{label}</span><div className="analytics-track"><div className={"analytics-fill "+key} style={{width:counts.all?Math.max(value/counts.all*100,value?4:0)+"%":"0%"}}/></div><b>{value}</b></div>)}
          </div><div className="analytics-panel"><h3>ملخص سريع</h3><p style={{fontSize:11,color:"#65768a",lineHeight:2,margin:0}}>إجمالي الإعلانات: {counts.all} · المنشورة: {counts.published} · تحت المراجعة: {counts.pending} · المرفوضة: {counts.rejected}.</p></div></> : null}\n          {activeTab==="listings" ? <div className="table-panel">
            <div className="panel-head"><h2>قائمة الإعلانات</h2><span>{visible.length} نتيجة · <button onClick={loadListings} disabled={refreshing} style={{border:0,background:"none",color:"#24527d",fontWeight:900,cursor:"pointer"}}>{refreshing?"جارٍ التحديث...":"تحديث ↻"}</button></span></div>
            {visible.length===0 ? <div className="empty">{listings.length===0?"لا توجد إعلانات محفوظة حتى الآن.":"لا توجد نتائج مطابقة للبحث."}</div> :
              <div className="table-scroll"><table><thead><tr><th>العقار</th><th>السعر</th><th>المعلن</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>
                {visible.map(item=><tr key={item.id}>
                  <td><div className="property-cell"><img className="thumb" src={item.image_urls?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=160&q=70"} alt=""/><div><b>{item.title || item.property_type}</b><small>{item.gate || "حدائق الأهرام"} · {item.property_type || "عقار"}</small></div></div></td>
                  <td>{money(item.price)} ج.م<br/><small>{item.deal_type==="إيجار"?"شهريًا":item.price_unit==="سعر المتر"?"للمتر":"إجمالي العقار"} · {item.payment_method||"كاش"}</small></td><td>{item.contact_name || "—"}<br/><small>{item.phone || ""}</small></td>
                  <td><span className={"status "+item.status}>{statusLabels[item.status] || item.status}</span></td>
                  <td>{item.created_at?new Date(item.created_at).toLocaleDateString("ar-EG"):"—"}</td>
                  <td><div className="actions"><button className="view" onClick={()=>setSelected(item)}>عرض</button>{item.status!=="published" && <button className="approve" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"published")}>{busyId===item.id?"...":"نشر"}</button>}{item.status!=="rejected" && <button className="reject" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"rejected")}>رفض</button>}{item.status==="rejected" && <button className="muted-btn" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,"pending")}>إعادة للمراجعة</button>}</div></td>
                </tr>)}
              </tbody></table></div>}
          </div> : <div className="table-panel">
            <div className="panel-head"><h2>حسابات الملاك والوسطاء</h2><span>{visibleProfiles.length} حساب · <button onClick={loadProfiles} style={{border:0,background:"none",color:"#24527d",fontWeight:900,cursor:"pointer"}}>تحديث ↻</button></span></div>
            {profileError && <div className="notice">{profileError} — تأكد من تشغيل ملف supabase/admin-users.sql في قاعدة البيانات.</div>}
            {visibleProfiles.length===0 ? <div className="empty">لا توجد حسابات مطابقة للبحث.</div> :
              <div className="table-scroll"><table style={{minWidth:650}}><thead><tr><th>الاسم</th><th>نوع الحساب</th><th>رقم الهاتف</th><th>البريد الإلكتروني</th><th>عدد الإعلانات</th><th>الحالة</th><th>تاريخ التسجيل</th><th>الإجراءات</th></tr></thead><tbody>
                {visibleProfiles.map(profile=><tr key={profile.id}>
                  <td><b>{profile.full_name || "بدون اسم"}</b><span className="profile-id">{profile.id}</span></td>
                  <td><span className="account-type">{profile.account_type || "مالك"}</span></td>
                  <td>{profile.phone || "—"}</td>
                  <td>{profile.email || listings.find(item=>item.submitted_by===profile.id)?.submitted_email || "—"}</td>
                  <td>{profileCounts[profile.id] || 0}</td>
                  <td><span className={"status "+(profile.is_active === false ? "rejected" : "published")}>{profile.is_active === false ? "موقوف" : "نشط"}</span></td>
                  <td>{profile.created_at?new Date(profile.created_at).toLocaleDateString("ar-EG"):"—"}</td>
                  <td><div className="account-actions"><button className="view" onClick={()=>setSelectedProfile(profile)}>التفاصيل</button><button className={profile.is_active === false ? "account-active" : "account-disabled"} disabled={profileBusyId===profile.id} onClick={()=>toggleProfileActivation(profile)}>{profileBusyId===profile.id?"...":profile.is_active === false?"تفعيل":"إيقاف"}</button></div></td>
                </tr>)}
              </tbody></table></div>}
          </div>}
        </>}
      </section>
      {selectedProfile && <div className="modal-shade" onClick={()=>setSelectedProfile(null)}><section className="detail-modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelectedProfile(null)}>×</button>
        <h2>{selectedProfile.full_name || "حساب بدون اسم"}</h2>
        <p className="modal-sub">{selectedProfile.account_type || "مالك"} · {selectedProfile.is_active === false ? "الحساب موقوف" : "الحساب نشط"}</p>
        <div className="detail-grid">
          {[["البريد الإلكتروني",selectedProfile.email],["رقم الهاتف",selectedProfile.phone],["عدد الإعلانات",profileCounts[selectedProfile.id] || 0],["تاريخ التسجيل",selectedProfile.created_at?new Date(selectedProfile.created_at).toLocaleString("ar-EG"):"—"],["معرّف الحساب",selectedProfile.id]].map(([label,value])=><div className="detail-item" key={label}><small>{label}</small><b>{value || "—"}</b></div>)}
        </div>
        <h3 style={{fontSize:14,marginTop:20,color:"#173653"}}>إعلانات هذا الحساب</h3>
        {listings.filter(item=>item.submitted_by===selectedProfile.id).length===0 ? <p className="empty">لا توجد إعلانات مرتبطة بهذا الحساب.</p> : <div style={{display:"grid",gap:8,marginTop:10}}>
          {listings.filter(item=>item.submitted_by===selectedProfile.id).map(item=><div key={item.id} className="detail-item" style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}><div><b>{item.title || item.property_type}</b><small>{item.gate || "حدائق الأهرام"} · {money(item.price)} جنيه {item.deal_type==="إيجار"?"شهريًا":item.price_unit==="سعر المتر"?"للمتر":"إجمالي"} · {item.payment_method||"كاش"}</small></div><span className={"status "+item.status}>{statusLabels[item.status] || item.status}</span></div>)}
        </div>}
        <div className="modal-actions"><button style={{background:selectedProfile.is_active===false?"#e8f6ef":"#fceeee",color:selectedProfile.is_active===false?"#18764e":"#a33e3e"}} disabled={profileBusyId===selectedProfile.id} onClick={()=>toggleProfileActivation(selectedProfile)}>{selectedProfile.is_active===false?"إعادة تفعيل الحساب":"إيقاف الحساب"}</button></div>
      </section></div>}
      {selected && <div className="modal-shade" onClick={()=>setSelected(null)}><section className="detail-modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelected(null)}>×</button>
        <h2>{selected.title || selected.property_type}</h2><p className="modal-sub">{selected.gate || "حدائق الأهرام"} · {statusLabels[selected.status]}</p>
        {selected.image_urls?.length>0 && <div className="gallery">{selected.image_urls.map((url,i)=><img src={url} alt={"صورة العقار "+(i+1)} key={url}/>)}</div>}
        <div className="detail-grid">
          {[["نوع العملية",selected.deal_type],["نوع العقار",selected.property_type],["السعر",money(selected.price)+" جنيه "+(selected.deal_type==="إيجار"?"شهريًا":selected.price_unit==="سعر المتر"?"للمتر":"إجمالي العقار")],["طريقة الدفع",selected.payment_method||"كاش"],["المقدم",selected.down_payment!=null?money(selected.down_payment)+" جنيه":"—"],["مدة التقسيط",selected.installment_years?selected.installment_years+" سنة":"—"],["القسط الشهري",selected.monthly_installment!=null?money(selected.monthly_installment)+" جنيه":"—"],["المساحة",selected.area?money(selected.area)+" م²":"—"],["اسم المعلن",selected.contact_name],["رقم الهاتف",selected.phone],["البريد",selected.submitted_email],["تاريخ الإضافة",selected.created_at?new Date(selected.created_at).toLocaleString("ar-EG"):"—"]].map(([label,value])=><div className="detail-item" key={label}><small>{label}</small><b>{value || "—"}</b></div>)}
        </div>
        <p className="description">{selected.description || "لا يوجد وصف إضافي."}</p>
        <div className="modal-actions">{selected.phone && <a href={"tel:"+selected.phone} style={{background:"#edf3f8",color:"#244d75"}}>اتصال بالمعلن</a>}{selected.status!=="published" && <button style={{background:"#168254",color:"#fff"}} disabled={busyId===selected.id} onClick={()=>updateStatus(selected.id,"published")}>اعتماد ونشر</button>}{selected.status!=="rejected" && <button style={{background:"#f8eaea",color:"#a33e3e"}} disabled={busyId===selected.id} onClick={()=>updateStatus(selected.id,"rejected")}>رفض الإعلان</button>}</div>
      </section></div>}
    </main>
  );
}
