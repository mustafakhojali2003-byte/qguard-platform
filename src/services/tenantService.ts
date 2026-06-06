import {
  collection, doc, getDocs, setDoc,
  onSnapshot, updateDoc, deleteDoc, getDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";
import type { Tenant } from "../types";

// Same hash as main QGuard app — so owner can log in there
export function hashPassword(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = (hash * 33) ^ value.charCodeAt(i);
  return `h${(hash >>> 0).toString(16)}`;
}

// Create the owner account inside the tenant's data
export async function createTenantOwner(slug: string, name: string, email: string, password: string): Promise<void> {
  const ownerId = `owner-${slug}-${Date.now().toString(36)}`;
  const allPerms = [
    "reports","alerts","attendance","buildings","viewReports","chat","visitors",
    "shifts","violations","scores","tasks","analytics","audit","patrol","sos","users","map",
  ];
  await setDoc(doc(firestore, "tenants", slug, "approved_users", ownerId), {
    name, email, phone: "", role: "owner", status: "approved",
    permissions: allPerms, rating: 5, passwordHash: hashPassword(password),
    soundEnabled: true, desktopNotificationsEnabled: true, showFullToAdmin: true,
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "), violations: 0,
  });
}

// Tenants collection — root level (not under any tenant)
const tenantsCol = () => collection(firestore, "tenants");

// ─── Subscribe to all tenants (real-time) ────────────────────────────────────
export function subscribeTenants(cb: (tenants: Tenant[]) => void): () => void {
  return onSnapshot(tenantsCol(), snap => {
    cb(snap.docs.map(d => ({ ...d.data(), slug: d.id }) as Tenant));
  }, () => cb([]));
}

// ─── Get single tenant ────────────────────────────────────────────────────────
export async function getTenant(slug: string): Promise<Tenant | null> {
  try {
    const snap = await getDoc(doc(firestore, "tenants", slug));
    if (!snap.exists()) return null;
    return { ...snap.data(), slug } as Tenant;
  } catch { return null; }
}

// ─── Create tenant ────────────────────────────────────────────────────────────
export async function createTenant(tenant: Tenant): Promise<void> {
  const { slug, ...data } = tenant;
  await setDoc(doc(firestore, "tenants", slug), data);
}

// ─── Update tenant ────────────────────────────────────────────────────────────
export async function updateTenant(slug: string, data: Partial<Tenant>): Promise<void> {
  await updateDoc(doc(firestore, "tenants", slug), data as any);
}

// ─── Delete tenant ────────────────────────────────────────────────────────────
export async function deleteTenant(slug: string): Promise<void> {
  await deleteDoc(doc(firestore, "tenants", slug));
}

// ─── Get tenant user count ────────────────────────────────────────────────────
export async function getTenantUserCount(slug: string): Promise<number> {
  try {
    const snap = await getDocs(collection(firestore, "tenants", slug, "approved_users"));
    return snap.size;
  } catch { return 0; }
}
