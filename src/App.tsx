import { useState, useEffect } from "react";
import { subscribeTenants, createTenant, updateTenant, deleteTenant, getTenantUserCount, createTenantOwner, subscribeFeedback, markFeedbackRead, deleteFeedback, type Feedback } from "./services/tenantService";
import type { Tenant } from "./types";

const QGUARD_APP_URL = "https://mustafaqa.vercel.app";

type Lang = "ar" | "en";

// ─── Translations ──────────────────────────────────────────────────────────────
const T: Record<string, { ar: string; en: string }> = {
  platform: { ar: "QGuard Platform", en: "QGuard Platform" },
  subtitle: { ar: "لوحة إدارة الشركات", en: "Companies Admin Panel" },
  loginSubtitle: { ar: "لوحة إدارة الشركات — خاص بالمشرف", en: "Companies Admin Panel — Admin only" },
  adminPass: { ar: "كلمة مرور المشرف", en: "Admin Password" },
  login: { ar: "دخول", en: "Login" },
  wrongPass: { ar: "كلمة المرور غير صحيحة", en: "Incorrect password" },
  origApp: { ar: "التطبيق الأصلي", en: "Main App" },
  logout: { ar: "خروج", en: "Logout" },
  companies: { ar: "الشركات", en: "Companies" },
  feedbackTab: { ar: "الملاحظات", en: "Feedback" },
  total: { ar: "الإجمالي", en: "Total" },
  active: { ar: "نشطة", en: "Active" },
  expired: { ar: "منتهية", en: "Expired" },
  inactive: { ar: "موقوفة", en: "Suspended" },
  newCompany: { ar: "شركة جديدة", en: "New Company" },
  search: { ar: "بحث...", en: "Search..." },
  noResults: { ar: "لا نتائج", en: "No results" },
  noCompanies: { ar: "لا توجد شركات بعد", en: "No companies yet" },
  clickNew: { ar: "اضغط 'شركة جديدة' للبدء", en: "Click 'New Company' to start" },
  suspended: { ar: "⛔ موقوفة", en: "⛔ Suspended" },
  expiredBadge: { ar: "⏰ منتهية", en: "⏰ Expired" },
  activeBadge: { ar: "✅ نشطة", en: "✅ Active" },
  day: { ar: "يوم", en: "days" },
  open: { ar: "فتح", en: "Open" },
  link: { ar: "رابط", en: "Link" },
  suspend: { ar: "إيقاف", en: "Suspend" },
  activate: { ar: "تفعيل", en: "Activate" },
  owner: { ar: "المالك", en: "Owner" },
  linkCopied: { ar: "📋 تم نسخ الرابط", en: "📋 Link copied" },
  suspended2: { ar: "⛔ تم الإيقاف", en: "⛔ Suspended" },
  activated: { ar: "✅ تم التفعيل", en: "✅ Activated" },
  noFeedback: { ar: "لا توجد ملاحظات بعد", en: "No feedback yet" },
  bug: { ar: "🐛 خطأ", en: "🐛 Bug" },
  suggestion: { ar: "💡 اقتراح", en: "💡 Suggestion" },
  other: { ar: "📝 أخرى", en: "📝 Other" },
  new: { ar: "جديد", en: "New" },
  markRead: { ar: "✓ مقروء", en: "✓ Read" },
  editCompany: { ar: "✏️ تعديل شركة", en: "✏️ Edit Company" },
  addCompany: { ar: "➕ إضافة شركة جديدة", en: "➕ Add New Company" },
  slugLabel: { ar: "رمز الشركة (slug)", en: "Company Code (slug)" },
  slugPlaceholder: { ar: "مثال: alhazm", en: "e.g: alhazm" },
  theLink: { ar: "الرابط", en: "Link" },
  arName: { ar: "الاسم العربي", en: "Arabic Name" },
  enName: { ar: "الاسم الإنجليزي", en: "English Name" },
  ownerName: { ar: "اسم المالك", en: "Owner Name" },
  ownerEmail: { ar: "بريد المالك", en: "Owner Email" },
  maxUsers: { ar: "حد المستخدمين", en: "Max Users" },
  subEnd: { ar: "انتهاء الاشتراك", en: "Subscription End" },
  ownerPass: { ar: "🔑 كلمة مرور المالك (لأول تسجيل دخول)", en: "🔑 Owner Password (first login)" },
  passPlaceholder: { ar: "6 أحرف على الأقل", en: "At least 6 chars" },
  logoUrl: { ar: "رابط الشعار (اختياري)", en: "Logo URL (optional)" },
  notes: { ar: "ملاحظات", en: "Notes" },
  notesPlaceholder: { ar: "ملاحظات...", en: "Notes..." },
  activeToggle: { ar: "✅ نشطة", en: "✅ Active" },
  inactiveToggle: { ar: "⛔ موقوفة", en: "⛔ Suspended" },
  save: { ar: "💾 حفظ", en: "💾 Save" },
  create: { ar: "➕ إنشاء", en: "➕ Create" },
  cancel: { ar: "إلغاء", en: "Cancel" },
  errSlug: { ar: "رمز الشركة مطلوب", en: "Company code required" },
  errSlugFmt: { ar: "الرمز: أحرف إنجليزية صغيرة وأرقام وشرطة فقط", en: "Code: lowercase letters, numbers, hyphens only" },
  errArName: { ar: "اسم الشركة العربي مطلوب", en: "Arabic name required" },
  errEnName: { ar: "اسم الشركة الإنجليزي مطلوب", en: "English name required" },
  errMaxUsers: { ar: "عدد المستخدمين يجب أن يكون 1 على الأقل", en: "Max users must be at least 1" },
  errOwnerEmail: { ar: "بريد المالك مطلوب لإنشاء حسابه", en: "Owner email required to create account" },
  errOwnerPass: { ar: "كلمة مرور المالك (6 أحرف على الأقل)", en: "Owner password (at least 6 chars)" },
  updated: { ar: "✅ تم التحديث", en: "✅ Updated" },
  createdWithOwner: { ar: "✅ تم إنشاء الشركة وحساب المالك", en: "✅ Company and owner account created" },
  errGeneric: { ar: "❌ حدث خطأ", en: "❌ An error occurred" },
  deleted: { ar: "🗑 تم الحذف", en: "🗑 Deleted" },
  errDelete: { ar: "❌ فشل الحذف", en: "❌ Delete failed" },
  deleteQ: { ar: "حذف", en: "Delete" },
  deleteNote: { ar: "سيتم حذفها من لوحة الإدارة فقط.", en: "Will be removed from admin panel only." },
  delete: { ar: "🗑 حذف", en: "🗑 Delete" },
  ownerAccount: { ar: "🔑 حساب مالك", en: "🔑 Owner Account" },
  ownerResetDesc: { ar: "سيتم إنشاء/إعادة تعيين حساب المالك بالبريد:", en: "Owner account will be created/reset with email:" },
  noOwnerEmail: { ar: "⚠️ لا يوجد بريد مالك. عدّل الشركة وأضف بريد المالك أولاً.", en: "⚠️ No owner email. Edit company and add owner email first." },
  tempPass: { ar: "كلمة المرور المؤقتة", en: "Temporary Password" },
  tempPassPlaceholder: { ar: "6 أحرف على الأقل — يغيّرها المالك لاحقاً", en: "At least 6 chars — owner changes it later" },
  createReset: { ar: "✅ إنشاء / إعادة تعيين", en: "✅ Create / Reset" },
  errPassMin: { ar: "❌ كلمة المرور 6 أحرف على الأقل", en: "❌ Password at least 6 chars" },
  ownerCreated: { ar: "✅ تم إنشاء حساب المالك", en: "✅ Owner account created" },
  afterCreate: { ar: "بعد الإنشاء، أعطِ المالك:", en: "After creation, give the owner:" },
  theLinkLabel: { ar: "الرابط", en: "Link" },
  theEmail: { ar: "البريد", en: "Email" },
  thePass: { ar: "كلمة المرور", en: "Password" },
  defaultOwner: { ar: "المالك", en: "Owner" },
};

const t = (lang: Lang, key: string) => T[key]?.[lang] ?? key;

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

const LangToggle = ({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) => (
  <div className="flex rounded-2xl border border-white/10 bg-white/5 p-0.5">
    <button onClick={() => setLang("ar")} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${lang === "ar" ? "bg-amber-500 text-black" : "text-slate-400"}`}>العربية</button>
    <button onClick={() => setLang("en")} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${lang === "en" ? "bg-amber-500 text-black" : "text-slate-400"}`}>English</button>
  </div>
);

function LoginScreen({ onLogin, lang, setLang }: { onLogin: () => void; lang: Lang; setLang: (l: Lang) => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const check = () => {
    if (pass === "mus2003kh") { onLogin(); }
    else setErr(t(lang, "wrongPass"));
  };
  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-[#040818] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center"><LangToggle lang={lang} setLang={setLang} /></div>
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-amber-400/30 bg-[#111b3d] shadow-[0_0_28px_rgba(245,158,11,0.35)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 3l7 3v5c0 5.25-3 8.5-7 10-4-1.5-7-4.75-7-10V6l7-3Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-3xl font-black text-amber-400">QGuard Platform</div>
          <div className="text-sm text-slate-500">{t(lang, "loginSubtitle")}</div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4">
          {err && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</div>}
          <Input label={t(lang, "adminPass")} type="password" placeholder="••••••••" value={pass}
            onChange={(e: any) => setPass(e.target.value)}
            onKeyDown={(e: any) => e.key === "Enter" && check()} />
          <Btn className="w-full h-12 text-base" onClick={check}>🔐 {t(lang, "login")}</Btn>
        </div>
      </div>
    </div>
  );
}

function TenantModal({ tenant, onSave, onClose, lang }: { tenant?: Tenant | null; onSave: (t: Tenant, ownerPassword: string) => void; onClose: () => void; lang: Lang }) {
  const isEdit = !!tenant;
  const [form, setForm] = useState<Tenant>(tenant ?? {
    slug: "", companyName: "", companyNameEn: "", logo: "", maxUsers: 20, active: true,
    subscriptionEnd: new Date(Date.now() + 365*86400000).toISOString().slice(0,10),
    createdAt: new Date().toISOString(), ownerEmail: "", ownerName: "", notes: "",
  });
  const [ownerPassword, setOwnerPassword] = useState("");
  const [err, setErr] = useState("");
  const s = (k: keyof Tenant) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = () => {
    if (!form.slug.trim()) return setErr(t(lang, "errSlug"));
    if (!/^[a-z0-9-]+$/.test(form.slug)) return setErr(t(lang, "errSlugFmt"));
    if (!form.companyName.trim()) return setErr(t(lang, "errArName"));
    if (!form.companyNameEn.trim()) return setErr(t(lang, "errEnName"));
    if (form.maxUsers < 1) return setErr(t(lang, "errMaxUsers"));
    if (!isEdit) {
      if (!form.ownerEmail?.trim()) return setErr(t(lang, "errOwnerEmail"));
      if (!ownerPassword.trim() || ownerPassword.length < 6) return setErr(t(lang, "errOwnerPass"));
    }
    setErr(""); onSave(form, ownerPassword);
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-white">{isEdit ? t(lang, "editCompany") : t(lang, "addCompany")}</div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10">✕</button>
        </div>
        {err && <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-300">{err}</div>}
        <Input label={t(lang, "slugLabel")} placeholder={t(lang, "slugPlaceholder")} value={form.slug} onChange={s("slug")} disabled={isEdit} />
        {!isEdit && form.slug && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-300">
            🔗 {t(lang, "theLink")}: {QGUARD_APP_URL}/{form.slug}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input label={t(lang, "arName")} placeholder="مركز الأمن" value={form.companyName} onChange={s("companyName")} />
          <Input label={t(lang, "enName")} placeholder="Security Center" value={form.companyNameEn} onChange={s("companyNameEn")} />
          <Input label={t(lang, "ownerName")} placeholder="Ahmed" value={form.ownerName ?? ""} onChange={s("ownerName")} />
          <Input label={t(lang, "ownerEmail")} placeholder="owner@co.com" value={form.ownerEmail ?? ""} onChange={s("ownerEmail")} />
          <Input label={t(lang, "maxUsers")} type="number" min={1} value={form.maxUsers}
            onChange={(e: any) => setForm(p => ({ ...p, maxUsers: parseInt(e.target.value)||1 }))} />
          <Input label={t(lang, "subEnd")} type="date" value={form.subscriptionEnd} onChange={s("subscriptionEnd")} />
        </div>
        {!isEdit && (
          <Input label={t(lang, "ownerPass")} type="text" placeholder={t(lang, "passPlaceholder")}
            value={ownerPassword} onChange={(e: any) => setOwnerPassword(e.target.value)} />
        )}
        <Input label={t(lang, "logoUrl")} placeholder="https://..." value={form.logo ?? ""} onChange={s("logo")} />
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-400">{t(lang, "notes")}</label>
          <textarea value={form.notes ?? ""} onChange={(e: any) => setForm(p => ({...p, notes: e.target.value}))} rows={2}
            className="w-full rounded-2xl border border-white/10 bg-[#070d22] px-4 py-3 text-white outline-none text-sm resize-none" placeholder={t(lang, "notesPlaceholder")} />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm(p => ({...p, active: !p.active}))}
            className={`relative h-6 w-11 rounded-full transition ${form.active ? "bg-amber-500" : "bg-slate-700"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.active ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm text-slate-300">{form.active ? t(lang, "activeToggle") : t(lang, "inactiveToggle")}</span>
        </div>
        <div className="flex gap-3 pt-1">
          <Btn className="flex-1 h-11" onClick={submit}>{isEdit ? t(lang, "save") : t(lang, "create")}</Btn>
          <Btn variant="secondary" className="h-11 px-6" onClick={onClose}>{t(lang, "cancel")}</Btn>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("qgp-lang") as Lang) || "ar");
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("qgp-v1") === "1");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create"|"edit"|null>(null);
  const [editTenant, setEditTenant] = useState<Tenant|null>(null);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [userCounts, setUserCounts] = useState<Record<string,number>>({});
  const [ownerReset, setOwnerReset] = useState<Tenant|null>(null);
  const [ownerResetPass, setOwnerResetPass] = useState("");
  const [view, setView] = useState<"companies"|"feedback">("companies");
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem("qgp-lang", l); };

  useEffect(() => {
    if (!loggedIn) return;
    const unsub = subscribeFeedback(items => setFeedback(items.sort((a,b) => b.createdAt.localeCompare(a.createdAt))));
    return unsub;
  }, [loggedIn]);

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

  const handleSave = async (tn: Tenant, ownerPassword: string) => {
    try {
      if (modal === "edit") {
        await updateTenant(tn.slug, tn);
        showToast(t(lang, "updated"));
      } else {
        await createTenant(tn);
        if (tn.ownerEmail && ownerPassword) {
          await createTenantOwner(tn.slug, tn.ownerName || t(lang, "defaultOwner"), tn.ownerEmail, ownerPassword);
        }
        showToast(t(lang, "createdWithOwner"));
      }
      setModal(null); setEditTenant(null);
    } catch { showToast(t(lang, "errGeneric"), false); }
  };

  const handleDelete = async (slug: string) => {
    try { await deleteTenant(slug); showToast(t(lang, "deleted")); setConfirmDelete(null); }
    catch { showToast(t(lang, "errDelete"), false); }
  };

  if (!loggedIn) return <LoginScreen lang={lang} setLang={changeLang} onLogin={() => { sessionStorage.setItem("qgp-v1","1"); setLoggedIn(true); }} />;

  const filtered = tenants.filter(tn => !search ||
    tn.companyName.includes(search) || tn.companyNameEn.toLowerCase().includes(search.toLowerCase()) || tn.slug.includes(search));

  const stats = {
    total: tenants.length,
    active: tenants.filter(tn => tn.active && daysLeft(tn.subscriptionEnd) >= 0).length,
    expired: tenants.filter(tn => daysLeft(tn.subscriptionEnd) < 0).length,
    inactive: tenants.filter(tn => !tn.active).length,
  };

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-[#040818] text-white">
      {toast && (
        <div className={`fixed top-4 ${lang === "ar" ? "right-4" : "left-4"} z-50 rounded-2xl border px-4 py-3 text-sm font-bold shadow-2xl ${toast.ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
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
              <div className="text-xs text-slate-500">{t(lang, "subtitle")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} setLang={changeLang} />
            <a href={QGUARD_APP_URL} target="_blank" rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition">
              🔗 {t(lang, "origApp")}
            </a>
            <Btn variant="secondary" className="text-xs" onClick={()=>{sessionStorage.removeItem("qgp-v1");setLoggedIn(false);}}>🚪 {t(lang, "logout")}</Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex gap-2">
          <button onClick={() => setView("companies")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition ${view === "companies" ? "bg-amber-500 text-black border-amber-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
            🏢 {t(lang, "companies")}
          </button>
          <button onClick={() => setView("feedback")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold border transition relative ${view === "feedback" ? "bg-amber-500 text-black border-amber-500" : "bg-white/5 text-slate-300 border-white/10"}`}>
            📬 {t(lang, "feedbackTab")}
            {feedback.filter(f => !f.read).length > 0 && (
              <span className={`absolute -top-2 ${lang === "ar" ? "-left-2" : "-right-2"} flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-black text-white`}>
                {feedback.filter(f => !f.read).length}
              </span>
            )}
          </button>
        </div>

        {view === "feedback" ? (
          <div className="space-y-3">
            {feedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 py-16">
                <div className="text-5xl mb-3">📭</div>
                <div className="font-black text-white">{t(lang, "noFeedback")}</div>
              </div>
            ) : feedback.map(f => (
              <div key={f.id} className={`rounded-[20px] border p-5 ${f.read ? "border-white/10 bg-[#0b132b] opacity-70" : "border-amber-400/30 bg-amber-500/5"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge color={f.type === "bug" ? "red" : f.type === "suggestion" ? "amber" : "slate"}>
                        {f.type === "bug" ? t(lang, "bug") : f.type === "suggestion" ? t(lang, "suggestion") : t(lang, "other")}
                      </Badge>
                      <span className="font-black text-white">{f.userName}</span>
                      <span className="text-xs text-slate-500">({f.role})</span>
                      {!f.read && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{t(lang, "new")}</span>}
                    </div>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap">{f.message}</div>
                    <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-500">
                      <span>🏢 {f.tenantSlug}</span>
                      <span>✉️ {f.userEmail}</span>
                      <span>📅 {f.createdAt.slice(0, 16).replace("T", " ")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!f.read && <Btn variant="success" className="text-xs h-8 px-3" onClick={() => markFeedbackRead(f.id)}>{t(lang, "markRead")}</Btn>}
                    <Btn variant="danger" className="text-xs h-8 px-3" onClick={() => deleteFeedback(f.id)}>🗑</Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {label:t(lang,"total"),value:stats.total,color:"text-white"},
            {label:t(lang,"active"),value:stats.active,color:"text-emerald-400"},
            {label:t(lang,"expired"),value:stats.expired,color:"text-red-400"},
            {label:t(lang,"inactive"),value:stats.inactive,color:"text-amber-400"},
          ].map(s=>(
            <div key={s.label} className="rounded-[20px] border border-white/10 bg-[#0b132b] p-4">
              <div className="text-xs text-slate-500 mb-2">{s.label}</div>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Btn onClick={()=>{setEditTenant(null);setModal("create");}}>➕ {t(lang, "newCompany")}</Btn>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`🔍 ${t(lang, "search")}`}
            className="h-11 flex-1 min-w-[180px] rounded-2xl border border-white/10 bg-[#0b132b] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-400/60"/>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/5 py-16">
            <div className="text-5xl mb-3">🏢</div>
            <div className="font-black text-white">{search ? t(lang, "noResults") : t(lang, "noCompanies")}</div>
            {!search && <div className="text-slate-400 text-sm mt-1">{t(lang, "clickNew")}</div>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(tn => {
              const days = daysLeft(tn.subscriptionEnd);
              const isExp = days < 0;
              const isWarn = days >= 0 && days <= 30;
              return (
                <div key={tn.slug} className={`rounded-[20px] border p-5 ${!tn.active?"border-slate-700/40 bg-slate-800/20 opacity-60":isExp?"border-red-500/30 bg-red-500/5":"border-white/10 bg-[#0b132b]"}`}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-2xl overflow-hidden">
                      {tn.logo ? <img src={tn.logo} alt="" className="h-full w-full object-contain"/> : "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-white text-lg">{lang === "ar" ? tn.companyName : tn.companyNameEn}</span>
                        <Badge color={!tn.active?"slate":isExp?"red":"green"}>
                          {!tn.active?t(lang,"suspended"):isExp?t(lang,"expiredBadge"):t(lang,"activeBadge")}
                        </Badge>
                        {isWarn && !isExp && <Badge color="amber">⚠️ {days} {t(lang,"day")}</Badge>}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{lang === "ar" ? tn.companyNameEn : tn.companyName}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>🔗 /{tn.slug}</span>
                        <span>👥 {userCounts[tn.slug]??0}/{tn.maxUsers}</span>
                        <span>📅 {tn.subscriptionEnd}</span>
                        {tn.ownerName && <span>👤 {tn.ownerName}</span>}
                        {tn.ownerEmail && <span>✉️ {tn.ownerEmail}</span>}
                      </div>
                      {tn.notes && <div className="mt-1 text-xs text-slate-600 italic">📝 {tn.notes}</div>}
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0 items-start">
                      <a href={`${QGUARD_APP_URL}/${tn.slug}`} target="_blank" rel="noreferrer">
                        <Btn variant="secondary" className="text-xs h-8 px-3">🔗 {t(lang,"open")}</Btn>
                      </a>
                      <Btn variant="secondary" className="text-xs h-8 px-3" onClick={()=>{
                        navigator.clipboard.writeText(`${QGUARD_APP_URL}/${tn.slug}`);
                        showToast(t(lang,"linkCopied"));
                      }}>📋 {t(lang,"link")}</Btn>
                      <Btn variant={tn.active?"danger":"success"} className="text-xs h-8 px-3"
                        onClick={async()=>{await updateTenant(tn.slug,{active:!tn.active});showToast(tn.active?t(lang,"suspended2"):t(lang,"activated"));}}>
                        {tn.active?`⛔ ${t(lang,"suspend")}`:`✅ ${t(lang,"activate")}`}
                      </Btn>
                      <Btn variant="secondary" className="text-xs h-8 px-3" onClick={()=>{setEditTenant(tn);setModal("edit");}}>✏️</Btn>
                      <Btn variant="secondary" className="text-xs h-8 px-3" onClick={()=>{setOwnerReset(tn);setOwnerResetPass("");}}>🔑 {t(lang,"owner")}</Btn>
                      <Btn variant="danger" className="text-xs h-8 px-3" onClick={()=>setConfirmDelete(tn.slug)}>🗑</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </main>

      {(modal==="create"||modal==="edit") && (
        <TenantModal lang={lang} tenant={modal==="edit"?editTenant:null} onSave={handleSave} onClose={()=>{setModal(null);setEditTenant(null);}}/>
      )}

      {confirmDelete && (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)"}}>
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div className="font-black text-white">{t(lang,"deleteQ")} /{confirmDelete}؟</div>
            <div className="text-sm text-slate-400">{t(lang,"deleteNote")}</div>
            <div className="flex gap-3">
              <Btn variant="danger" className="flex-1 h-11" onClick={()=>handleDelete(confirmDelete)}>{t(lang,"delete")}</Btn>
              <Btn variant="secondary" className="flex-1 h-11" onClick={()=>setConfirmDelete(null)}>{t(lang,"cancel")}</Btn>
            </div>
          </div>
        </div>
      )}

      {ownerReset && (
        <div dir={lang === "ar" ? "rtl" : "ltr"} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)"}}
          onClick={e => { if (e.target === e.currentTarget) setOwnerReset(null); }}>
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0b132b] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-black text-white">{t(lang,"ownerAccount")} {lang === "ar" ? ownerReset.companyName : ownerReset.companyNameEn}</div>
              <button onClick={()=>setOwnerReset(null)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400">✕</button>
            </div>
            <p className="text-sm text-slate-400">
              {ownerReset.ownerEmail
                ? `${t(lang,"ownerResetDesc")} ${ownerReset.ownerEmail}`
                : t(lang,"noOwnerEmail")}
            </p>
            {ownerReset.ownerEmail && (
              <>
                <Input label={t(lang,"tempPass")} type="text" placeholder={t(lang,"tempPassPlaceholder")}
                  value={ownerResetPass} onChange={(e:any)=>setOwnerResetPass(e.target.value)} />
                <Btn className="w-full h-11" onClick={async()=>{
                  if (ownerResetPass.length < 6) { showToast(t(lang,"errPassMin"), false); return; }
                  try {
                    await createTenantOwner(ownerReset.slug, ownerReset.ownerName || t(lang,"defaultOwner"), ownerReset.ownerEmail!, ownerResetPass);
                    showToast(t(lang,"ownerCreated"));
                    setOwnerReset(null);
                  } catch { showToast(t(lang,"errGeneric"), false); }
                }}>{t(lang,"createReset")}</Btn>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                  {t(lang,"afterCreate")}<br/>
                  {t(lang,"theLinkLabel")}: {QGUARD_APP_URL}/{ownerReset.slug}<br/>
                  {t(lang,"theEmail")}: {ownerReset.ownerEmail}<br/>
                  {t(lang,"thePass")}: {ownerResetPass || "..."}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
