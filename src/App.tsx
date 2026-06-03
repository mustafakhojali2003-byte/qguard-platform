import { useState, useEffect } from "react";
import { subscribeTenants, createTenant, updateTenant, deleteTenant, getTenantUserCount } from "./services/tenantService";
import type { Tenant } from "./types";

const ADMIN_PASSWORD_HASH = "qguard2024admin";
const QGUARD_APP_URL = "https://mustafaqa.vercel.app";

function simpleHash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

const Btn = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }: any) => (
  <button type={type} disabled={disabled} onClick={onClick}
    className={`rounded-2xl px-4 py-2 font-bold text-sm transition disabled:opacity-40 cursor-pointer ${
      variant === "primary" ? "bg-amber-500 text-black hover:bg-amber-400" :
      variant === "danger"  ? "bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30" :
      variant === "success" ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30" :
      "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
    } ${className}`}>
    {children}
  </button>
);

const Input = ({ label, ...props }: any) => (
  <div>
    {label && <label className="mb-1 block text-xs font-semibold text-slate-400">{label}</label>}
    <input {...props} className="h-11 w-full rounded-2xl border border-white/10 bg-[#070d22] px-4 text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60 text-sm" />
  </div>
);

const Badge = ({ children, color = "slate" }: any) => (
  <span className={`rounded-xl px-2 py-0.5 text-xs font-bold border ${
    color === "green"  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
    color === "red"    ? "border-red-500/30 bg-red-500/10 text-red-300" :
    color === "amber"  ? "border-amber-500/30 bg-amber-500/10 text-amber-300" :
    "border-slate-500/30 bg-slate-500/10 text-slate-300"
  }`}>{children}</span>
);

function daysLeft(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const check = () => {
    if (simpleHash(pass) === simpleHash(ADMIN_PASSWORD_HASH)) { onLogin(); }
    else if (pass === "QGuard@Admin2024") { onLogin(); }
    else setErr("كلمة المرور غير صحيحة");
  };
  return (
    <div className="min-h-screen bg-[#040818] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-amber-400/30 bg-[#111b3d] shadow-[0_0_28px_rgba(245,158,11,0.35)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l7 3v5c0 5.25-3 8.5-7 10-4-1.5-7-4.75-7-10V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-3xl font-black text-amber-400">QGuard Platform</div>
          <div className="text-sm text-slate-500">لوحة إدارة الشركات — خاص بالمشرف</div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4">
          {err && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</div>}
          <Input label="كلمة مرور المشرف" type="password" placeholder="••••••••" value={pass}
            onChange={(e: any) => setPass(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && check()} />
          <Btn className="w-full h-12 text-base" onClick={check}>🔐 دخول</Btn>
        </div>
      </div>
    </div>
  );
}

function TenantModal({ tenant, onSave, onClose }: { tenant?: Tenant | null; onSave: (t: Tenant) => void; onClose: () => void }) {
  const isEdit = !!tenant;
  const [form, setForm] = useState<Tenant>(tenant ?? {
    slug: "", companyName: "", companyNameEn: "", logo: "", maxUsers: 20, active: true,
    subscriptionEnd: new Date(Date.now() + 365*86400000).toISOString().slice(0,10),
    createdAt: new Date().toISOString(), ownerEmail: "", ownerName: "", notes: "",
  });
  const [err, setErr] = useState("");
  const s = (k: keyof Tenant) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.slug.trim()) return setErr("رمز الشركة مطلوب");
    if (!/^[a-z0-9-]+$/.test(form.slug)) return setErr("الرمز: أحرف إنجليزية صغيرة وأرقام وشرطة فقط");
    if (!form.companyName.trim()) return setErr("اسم الشركة العربي مطلوب");
    if (!form.companyNameEn.trim()) return setErr("اسم الشركة الإنجليزي مطلوب");
    if (form.maxUsers < 1) return setErr("عدد المستخدمين يجب أن يكون 1 على الأقل");
    setErr(""); onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-white">{isEdit ? "✏️ تعديل شركة" : "➕ إضافة شركة جديدة"}</div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10">✕</button>
        </div>
        {err && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-300">{err}</div>}
        <Input label="رمز الشركة (slug)" placeholder="مثال: alhazm" value={form.slug} onChange={s("slug")} disabled={isEdit} />
        {!isEdit && form.slug && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-300">
            🔗 الرابط: {QGUARD_APP_URL}/{form.slug}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label="الاسم العربي" placeholder="مركز الأمن" value={form.companyName} onChange={s("companyName")} />
          <Input label="الاسم الإنجليزي" placeholder="Security Center" value={form.companyNameEn} onChange={s("companyNameEn")} />
          <Input label="اسم المالك" placeholder="أحمد محمد" value={form.ownerName ?? ""} onChange={s("ownerName")} />
          <Input label="بريد المالك" placeholder="owner@co.com" value={form.ownerEmail ?? ""} onChange={s("ownerEmail")} />
          <Input label="حد المستخدمين" type="number" min={1} value={form.maxUsers}
            onChange={(e: any) => setForm(p => ({ ...p, maxUsers: parseInt(e.target.value)||1 }))} />
          <Input label="انتهاء الاشتراك" type="date" value={form.subscriptionEnd} onChange={s("subscriptionEnd")} />
        </div>
        <Input label="رابط الشعار (اختياري)" placeholder="https://..." value={form.logo ?? ""} onChange={s("logo")} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-400">ملاحظات</label>
          <textarea value={form.notes ?? ""} onChange={(e: any) => setForm(p => ({...p, notes: e.target.value}))} rows={2}
            className="w-full rounded-2xl border border-white/10 bg-[#070d22] px-4 py-3 text-white outline-none text-sm resize-none" placeholder="ملاحظات..." />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm(p => ({...p, active: !p.active}))}
            className={`relative h-6 w-11 rounded-full transition ${form.active ? "bg-amber-500" : "bg-slate-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.active ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm text-slate-300">{form.active ? "✅ نشطة" : "⛔ موقوفة"}</span>
        </div>
        <div className="flex gap-3 pt-1">
          <Btn className="flex-1 h-11" onClick={submit}>{isEdit ? "💾 حفظ" : "➕ إنشاء"}</Btn>
          <Btn variant="secondary" className="h-11 px-6" onClick={onClose}>إلغاء</Btn>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("qgp-v1") === "1");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create"|"edit"|null>(null);
  const [editTenant, setEditTenant] = useState<Tenant|null>(null);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [userCounts, setUserCounts] = useState<Record<string,number>>({});

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    if (!loggedIn) return;
    const unsub = subscribeTenants(data => {
      setTenants(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
      data.forEach(t => getTenantUserCount(t.slug).then(n => setUserCounts(p => ({...p,[t.slug]:n}))));
    });
    return unsub;
  }, [loggedIn]);

  const handleSave = async (t: Tenant) => {
    try {
      modal === "edit" ? await updateTenant(t.slug, t) : await createTenant(t);
      showToast(modal === "edit" ? "✅ تم التحديث" : "✅ تم إنشاء الشركة");
      setModal(null); setEditTenant(null);
    } catch { showToast("❌ حدث خطأ", false); }
  };

  const handleDelete = async (slug: string) => {
    try { await deleteTenant(slug); showToast("🗑 تم الحذف"); setConfirmDelete(null); }
    catch { showToast("❌ فشل الحذف", false); }
  };

  if (!loggedIn) return <LoginScreen onLogin={() => { sessionStorage.setItem("qgp-v1","1"); setLoggedIn(true); }} />;

  const filtered = tenants.filter(t => !search ||
    t.companyName.includes(search) || t.companyNameEn.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search));

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.active && daysLeft(t.subscriptionEnd) >= 0).length,
    expired: tenants.filter(t => daysLeft(t.subscriptionEnd) < 0).length,
    inactive: tenants.filter(t => !t.active).length,
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#040818] text-white">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <header className="border-b border-white/10 bg-[#0a1024] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-amber-400/30 bg-[#111b3d] shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 5.25-3 8.5-7 10-4-1.5-7-4.75-7-10V6l7-3Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-amber-400">QGuard Platform</div>
              <div className="text-xs text-slate-500">لوحة إدارة الشركات</div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={QGUARD_APP_URL} target="_blank" rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition">
              🔗 التطبيق الأصلي
            </a>
            <Btn variant="secondary" className="text-xs" onClick={()=>{sessionStorage.removeItem("qgp-v1");setLoggedIn(false);}}>🚪 خروج</Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {label:"الإجمالي",value:stats.total,color:"text-white"},
            {label:"نشطة",value:stats.active,color:"text-emerald-400"},
            {label:"منتهية",value:stats.expired,color:"text-red-400"},
            {label:"موقوفة",value:stats.inactive,color:"text-amber-400"},
          ].map(s=>(
            <div key={s.label} className="rounded-[20px] border border-white/10 bg-[#0b132b] p-4">
              <div className="text-xs text-slate-500 mb-2">{s.label}</div>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Btn onClick={()=>{setEditTenant(null);setModal("create");}}>➕ شركة جديدة</Btn>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 بحث..."
            className="h-11 flex-1 min-w-[180px] rounded-2xl border border-white/10 bg-[#0b132b] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60"/>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 py-16">
            <div className="text-5xl mb-3">🏢</div>
            <div className="font-black text-white">{search ? "لا نتائج" : "لا توجد شركات بعد"}</div>
            {!search && <div className="text-slate-400 text-sm mt-1">اضغط 'شركة جديدة' للبدء</div>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(t => {
              const days = daysLeft(t.subscriptionEnd);
              const isExp = days < 0;
              const isWarn = days >= 0 && days <= 30;
              return (
                <div key={t.slug} className={`rounded-[20px] border p-5 ${!t.active?"border-slate-700/40 bg-slate-800/20 opacity-60":isExp?"border-red-500/30 bg-red-500/5":"border-white/10 bg-[#0b132b]"}`}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-2xl overflow-hidden">
                      {t.logo ? <img src={t.logo} alt="" className="h-full w-full object-contain"/> : "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-white text-lg">{t.companyName}</span>
                        <Badge color={!t.active?"slate":isExp?"red":"green"}>
                          {!t.active?"⛔ موقوفة":isExp?"⏰ منتهية":"✅ نشطة"}
                        </Badge>
                        {isWarn && !isExp && <Badge color="amber">⚠️ {days} يوم</Badge>}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{t.companyNameEn}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>🔗 /{t.slug}</span>
                        <span>👥 {userCounts[t.slug]??0}/{t.maxUsers}</span>
                        <span>📅 {t.subscriptionEnd}</span>
                        {t.ownerName && <span>👤 {t.ownerName}</span>}
                        {t.ownerEmail && <span>✉️ {t.ownerEmail}</span>}
                      </div>
                      {t.notes && <div className="mt-1 text-xs text-slate-600 italic">📝 {t.notes}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0 items-start">
                      <a href={`${QGUARD_APP_URL}/${t.slug}`} target="_blank" rel="noreferrer">
                        <Btn variant="secondary" className="text-xs h-8 px-3">🔗 فتح</Btn>
                      </a>
                      <Btn variant="secondary" className="text-xs h-8 px-3" onClick={()=>{
                        navigator.clipboard.writeText(`${QGUARD_APP_URL}/${t.slug}`);
                        showToast("📋 تم نسخ الرابط");
                      }}>📋 رابط</Btn>
                      <Btn variant={t.active?"danger":"success"} className="text-xs h-8 px-3"
                        onClick={async()=>{await updateTenant(t.slug,{active:!t.active});showToast(t.active?"⛔ تم الإيقاف":"✅ تم التفعيل");}}>
                        {t.active?"⛔ إيقاف":"✅ تفعيل"}
                      </Btn>
                      <Btn variant="secondary" className="text-xs h-8 px-3" onClick={()=>{setEditTenant(t);setModal("edit");}}>✏️</Btn>
                      <Btn variant="danger" className="text-xs h-8 px-3" onClick={()=>setConfirmDelete(t.slug)}>🗑</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {(modal==="create"||modal==="edit") && (
        <TenantModal tenant={modal==="edit"?editTenant:null} onSave={handleSave} onClose={()=>{setModal(null);setEditTenant(null);}}/>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)"}}>
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="font-black text-white">حذف /{confirmDelete}؟</div>
            <div className="text-sm text-slate-400">سيتم حذفها من لوحة الإدارة فقط.</div>
            <div className="flex gap-3">
              <Btn variant="danger" className="flex-1 h-11" onClick={()=>handleDelete(confirmDelete)}>🗑 حذف</Btn>
              <Btn variant="secondary" className="flex-1 h-11" onClick={()=>setConfirmDelete(null)}>إلغاء</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
