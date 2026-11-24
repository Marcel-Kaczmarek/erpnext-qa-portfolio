import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;
let customerName: string;

test.beforeAll(async () => {
  api = await createApiContext();
  customerName = uniqueName("API-Contact-Customer");
  await api.post(resourceUrl("Customer"), { data: { customer_name: customerName } });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Contact API", () => {
  test("creates, reads, updates, and deletes a contact linked to a customer", async () => {
    const createResp = await api.post(resourceUrl("Contact"), {
      data: {
        first_name: uniqueName("API-Contact"),
        links: [{ link_doctype: "Customer", link_name: customerName }],
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    const contactName = created.data.name;

    const getResp = await api.get(resourceUrl("Contact", contactName));
    expect(getResp.status()).toBe(200);

    const updateResp = await api.put(resourceUrl("Contact", contactName), {
      data: { last_name: "Updated" },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.last_name).toBe("Updated");

    const deleteResp = await api.delete(resourceUrl("Contact", contactName));
    expect([200, 202]).toContain(deleteResp.status());
  });

  test("returns 404 for a non-existent contact", async () => {
    const resp = await api.get(resourceUrl("Contact", uniqueName("No-Such-Contact")));
    expect(resp.status()).toBe(404);
  });
});
