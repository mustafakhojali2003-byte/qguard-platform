import {
  collection, doc, getDocs, setDoc,
  onSnapshot, updateDoc, deleteDoc, getDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";
import type { Tenant } from "../types";

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
