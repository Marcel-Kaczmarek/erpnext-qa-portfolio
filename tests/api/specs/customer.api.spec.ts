import { test, expect, request, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;

test.beforeAll(async () => {
  api = await createApiContext();
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Customer API", () => {
  test("creates, reads, updates, and deletes a customer", async () => {
    const customerName = uniqueName("API-Customer");

    const createResp = await api.post(resourceUrl("Customer"), {
      data: { customer_name: customerName, customer_type: "Company" },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    const docName = created.data.name;

    const getResp = await api.get(resourceUrl("Customer", docName));
    expect(getResp.status()).toBe(200);
    const fetched = await getResp.json();
    expect(fetched.data.customer_name).toBe(customerName);

    const updateResp = await api.put(resourceUrl("Customer", docName), {
      data: { customer_type: "Individual" },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.customer_type).toBe("Individual");

    const deleteResp = await api.delete(resourceUrl("Customer", docName));
    expect([200, 202]).toContain(deleteResp.status());
  });

  test("rejects a customer created without the required customer_name field", async () => {
    const resp = await api.post(resourceUrl("Customer"), { data: { customer_type: "Company" } });
    expect(resp.status()).toBe(417);
  });

  test("rejects requests with no session", async () => {
    const baseURL = process.env.BASE_URL ?? "http://localhost:8080";
    // Explicit empty storageState guarantees no cookies leak in from the
    // "chromium" project's default authenticated storageState.
    const unauthed = await request.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    const resp = await unauthed.get(resourceUrl("Customer", "NoSuchCustomer"));
    expect([401, 403, 404]).toContain(resp.status());
    await unauthed.dispose();
  });
});
