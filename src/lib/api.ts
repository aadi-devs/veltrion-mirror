// Client for the Anuverse FastAPI backend.
// Set VITE_BACKEND_URL to the deployed API origin (e.g. https://api.anuverse.com).
export const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? "") + "/api";

export type BillingCycle = "monthly" | "quarterly" | "annually";

export interface Plan {
  id: string;
  name: string;
  ram?: string;
  vcores?: number;
  disk?: string;
  nvme?: string;
  players?: number;
  price: Record<BillingCycle, number>;
}

export interface PlanCategory {
  id: string;
  name: string;
  plans: Plan[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface MyOrder {
  order_ref: string;
  plan_name: string;
  plan_category: string;
  billing_cycle: string;
  price: string;
  ram: string;
  vcores: string;
  disk: string;
  status: string;
  provision_status: string;
  panel_url?: string | null;
  server_password?: string | null;
  server?: string | null;
  provision_error?: string | null;
  created_at: string;
  renewal_date?: string | null;
}

export interface CreatedOrder {
  order_ref: string;
  upi_uri: string;
  amount: number;
  plan_name: string;
  plan_category: string;
  billing_cycle: BillingCycle;
  order_id: string;
}

function detailToMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d?.msg ?? "Invalid input").join(", ");
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = (await res.json())?.detail;
    } catch {
      detail = undefined;
    }
    throw new Error(detailToMessage(detail, `Request failed (${res.status})`));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Plans ────────────────────────────────────────────────────────────────────
export const getMinecraftPlans = () => request<PlanCategory[]>("/plans");
export const getVpsPlans = () => request<PlanCategory[]>("/vps-plans");

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  request<{ user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string) =>
  request<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const getMe = () => request<{ user: User }>("/auth/me");
export const logout = () => request<unknown>("/auth/logout", { method: "POST" });

export const googleLoginUrl = `${API_BASE}/auth/google`;
export const discordLoginUrl = `${API_BASE}/auth/discord`;

// ── Orders ───────────────────────────────────────────────────────────────────
export const createOrder = (body: {
  plan_id: string;
  plan_category: "minecraft" | "vps";
  billing_cycle: BillingCycle;
  customer_name: string;
  email: string;
  discord: string;
}) => request<CreatedOrder>("/orders/", { method: "POST", body: JSON.stringify(body) });

export const submitPayment = (orderRef: string, utr: string, screenshot: File) => {
  const form = new FormData();
  form.append("utr", utr);
  form.append("screenshot", screenshot);
  return request<{ success: boolean }>(`/orders/${orderRef}/paid`, {
    method: "POST",
    body: form,
  });
};

export const getMyOrders = () => request<MyOrder[]>("/my/orders");

export function findPlan(categories: PlanCategory[], planId: string) {
  for (const cat of categories) {
    const plan = cat.plans.find((p) => p.id === planId);
    if (plan) return { plan, category: cat };
  }
  return null;
}

// ── Admin ────────────────────────────────────────────────────────────────────
export interface AdminOrder {
  id: string;
  order_ref: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  customer_name: string;
  discord: string;
  plan_id: string;
  plan_name: string;
  plan_category: string;
  billing_cycle: string;
  price: string;
  ram: string;
  vcores: string;
  disk: string;
  status: string;
  utr: string;
  payment_screenshot?: string | null;
  provision_status: string;
  server?: string | null;
  panel_url?: string | null;
  server_password?: string | null;
  provision_error?: string | null;
  created_at: string;
}

export const getAllOrders = () => request<AdminOrder[]>("/admin/all-orders");
export const markOrderPaid = (ref: string) =>
  request<AdminOrder>(`/admin/orders/${ref}/mark-paid`, { method: "POST" });
export const rejectOrder = (ref: string) =>
  request<unknown>(`/admin/orders/${ref}/reject`, { method: "POST" });

/** Plan editing (requires the admin plan endpoints on the backend). */
export const saveAdminPlan = (
  category: "minecraft" | "vps",
  categoryId: string,
  plan: Plan,
) =>
  request<Plan>(`/admin/plans/${category}/${categoryId}/${plan.id}`, {
    method: "PUT",
    body: JSON.stringify(plan),
  });
