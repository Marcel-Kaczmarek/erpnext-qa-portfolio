import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;
const prefix = uniqueName("API-List-Customer");
const names: string[] = [];

test.beforeAll(async () => {
  api = await createApiContext();
  for (let i = 0; i < 3; i++) {
    const name = `${prefix}-${i}`;
    names.push(name);
    await api.post(resourceUrl("Customer"), { data: { customer_name: name } });
  }
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Customer list query", () => {
  test("filters by a name prefix using a 'like' operator", async () => {
    const resp = await api.get(resourceUrl("Customer"), {
      params: { filters: JSON.stringify([["customer_name", "like", `${prefix}%`]]) },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.data.length).toBe(3);
  });

  test("respects the limit_page_length parameter", async () => {
    const resp = await api.get(resourceUrl("Customer"), {
      params: {
        filters: JSON.stringify([["customer_name", "like", `${prefix}%`]]),
        limit_page_length: "2",
      },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.data.length).toBe(2);
  });

  test("orders results by creation descending", async () => {
    const resp = await api.get(resourceUrl("Customer"), {
      params: {
        filters: JSON.stringify([["customer_name", "like", `${prefix}%`]]),
        order_by: "creation desc",
        fields: JSON.stringify(["name"]),
      },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.data[0].name).toContain(`${prefix}-2`);
  });
});
