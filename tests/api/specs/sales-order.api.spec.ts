import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName, futureDate } from "../../../fixtures/testData";

let api: APIRequestContext;
let customerName: string;
let itemCode: string;

test.beforeAll(async () => {
  api = await createApiContext();

  customerName = uniqueName("API-SO-Customer");
  await api.post(resourceUrl("Customer"), { data: { customer_name: customerName } });

  itemCode = uniqueName("API-SO-Item");
  await api.post(resourceUrl("Item"), {
    data: { item_code: itemCode, item_group: "All Item Groups", is_stock_item: 0 },
  });
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Sales Order API", () => {
  test("creates a sales order with one line item and reads it back", async () => {
    const createResp = await api.post(resourceUrl("Sales Order"), {
      data: {
        customer: customerName,
        delivery_date: futureDate(7),
        items: [{ item_code: itemCode, qty: 2, rate: 100 }],
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    expect(created.data.customer).toBe(customerName);
    expect(created.data.items).toHaveLength(1);

    const getResp = await api.get(resourceUrl("Sales Order", created.data.name));
    expect(getResp.status()).toBe(200);
    const fetched = await getResp.json();
    expect(fetched.data.grand_total).toBe(200);
  });

  test("rejects a sales order with no items", async () => {
    const resp = await api.post(resourceUrl("Sales Order"), {
      data: { customer: customerName, delivery_date: futureDate(7), items: [] },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });

  test("rejects a sales order for a non-existent customer", async () => {
    const resp = await api.post(resourceUrl("Sales Order"), {
      data: {
        customer: uniqueName("Nonexistent-Customer"),
        delivery_date: futureDate(7),
        items: [{ item_code: itemCode, qty: 1, rate: 100 }],
      },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});
