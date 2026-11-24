import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;
let customerName: string;
let itemCode: string;

test.beforeAll(async () => {
  api = await createApiContext();

  customerName = uniqueName("API-Quotation-Customer");
  await api.post(resourceUrl("Customer"), { data: { customer_name: customerName } });

  itemCode = uniqueName("API-Quotation-Item");
  await api.post(resourceUrl("Item"), {
    data: { item_code: itemCode, item_group: "All Item Groups", is_stock_item: 0 },
  });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Quotation API", () => {
  test("creates a quotation for a customer with one line item", async () => {
    const createResp = await api.post(resourceUrl("Quotation"), {
      data: {
        quotation_to: "Customer",
        party_name: customerName,
        items: [{ item_code: itemCode, qty: 3, rate: 50 }],
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    expect(created.data.grand_total).toBe(150);
  });

  test("lists quotations filtered by party_name", async () => {
    const resp = await api.get(resourceUrl("Quotation"), {
      params: {
        filters: JSON.stringify([["party_name", "=", customerName]]),
        fields: JSON.stringify(["name", "party_name", "grand_total"]),
      },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.data.length).toBeGreaterThan(0);
    for (const row of body.data) {
      expect(row.party_name).toBe(customerName);
    }
  });
});
