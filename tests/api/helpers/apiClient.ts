import { APIRequestContext, request } from "@playwright/test";

/**
 * Authenticates via Frappe's session login endpoint instead of a static
 * API key/secret: a fresh ERPNext site (e.g. one spun up per CI run) has
 * no pre-existing API key, but always accepts the admin user/password.
 * The returned context keeps the session cookie for subsequent requests.
 */
export async function createApiContext(): Promise<APIRequestContext> {
  const baseURL = process.env.BASE_URL ?? "http://localhost:8080";
  const context = await request.newContext({ baseURL });

  const loginResp = await context.post("/api/method/login", {
    form: {
      usr: process.env.ADMIN_USER ?? "Administrator",
      pwd: process.env.ADMIN_PASSWORD ?? "admin",
    },
  });

  if (!loginResp.ok()) {
    throw new Error(`API login failed with status ${loginResp.status()}`);
  }

  return context;
}

export function resourceUrl(doctype: string, name?: string): string {
  const base = `/api/resource/${encodeURIComponent(doctype)}`;
  return name ? `${base}/${encodeURIComponent(name)}` : base;
}
