import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName } from "../../../fixtures/testData";

let api: APIRequestContext;

test.beforeAll(async () => {
  api = await createApiContext();
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Item API", () => {
  test("creates, reads, updates, and deletes an item", async () => {
    const itemCode = uniqueName("API-Item");

    const createResp = await api.post(resourceUrl("Item"), {
      data: { item_code: itemCode, item_group: "All Item Groups" },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    expect(created.data.item_code).toBe(itemCode);

    const getResp = await api.get(resourceUrl("Item", itemCode));
    expect(getResp.status()).toBe(200);

    const updateResp = await api.put(resourceUrl("Item", itemCode), {
      data: { description: "Updated via API test" },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.description).toBe("Updated via API test");

    const deleteResp = await api.delete(resourceUrl("Item", itemCode));
    expect([200, 202]).toContain(deleteResp.status());
  });

  test("rejects an item created without the required item_group field", async () => {
    const resp = await api.post(resourceUrl("Item"), { data: { item_code: uniqueName("API-Item") } });
    expect(resp.status()).toBe(417);
  });
});
