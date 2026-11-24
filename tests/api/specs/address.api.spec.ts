import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;
let customerName: string;

test.beforeAll(async () => {
  api = await createApiContext();
  customerName = uniqueName("API-Address-Customer");
  await api.post(resourceUrl("Customer"), { data: { customer_name: customerName } });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Address API", () => {
  test("creates, reads, updates, and deletes an address linked to a customer", async () => {
    const createResp = await api.post(resourceUrl("Address"), {
      data: {
        address_title: customerName,
        address_type: "Billing",
        address_line1: "221B Baker Street",
        city: "London",
        country: "United Kingdom",
        links: [{ link_doctype: "Customer", link_name: customerName }],
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    const addressName = created.data.name;

    const getResp = await api.get(resourceUrl("Address", addressName));
    expect(getResp.status()).toBe(200);
    const fetched = await getResp.json();
    expect(fetched.data.city).toBe("London");

    const updateResp = await api.put(resourceUrl("Address", addressName), {
      data: { city: "Manchester" },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.city).toBe("Manchester");

    const deleteResp = await api.delete(resourceUrl("Address", addressName));
    expect([200, 202]).toContain(deleteResp.status());
  });

  test("rejects an address created without a country", async () => {
    const resp = await api.post(resourceUrl("Address"), {
      data: { address_title: uniqueName("API-Address"), address_type: "Billing", address_line1: "No country here" },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});
