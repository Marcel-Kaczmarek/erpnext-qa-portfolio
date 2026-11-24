import { test, expect } from "@playwright/test";
import { ItemPage } from "../pages/ItemPage";
import { uniqueName } from "../../../fixtures/testData";

test("creates a new item and finds it in the list view", async ({ page }) => {
  const itemCode = uniqueName("QA-Item");
  const item = new ItemPage(page);

  await item.createItem(itemCode);

  await page.goto("/desk/item");
  await expect(page.locator(".list-row", { hasText: itemCode }).first()).toBeVisible();
});
