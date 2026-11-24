import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;
let customerName: string;
let itemCode: string;

test.beforeAll(async () => {
  api = await createApiContext();

  customerName = uniqueName("API-SI-Customer");
  await api.post(resourceUrl("Customer"), { data: { customer_name: customerName } });

  itemCode = uniqueName("API-SI-Item");
  await api.post(resourceUrl("Item"), {
    data: { item_code: itemCode, item_group: "All Item Groups", is_stock_item: 0 },
  });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Sales Invoice API", () => {
  test("creates a sales invoice directly and verifies the grand total", async () => {
    const createResp = await api.post(resourceUrl("Sales Invoice"), {
      data: {
        customer: customerName,
        items: [{ item_code: itemCode, qty: 4, rate: 25 }],
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    expect(created.data.grand_total).toBe(100);
  });

  test("rejects a sales invoice created without a customer", async () => {
    const resp = await api.post(resourceUrl("Sales Invoice"), {
      data: { items: [{ item_code: itemCode, qty: 1, rate: 25 }] },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});
