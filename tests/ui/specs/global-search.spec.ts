import { test, expect } from "@playwright/test";
import { CustomerPage } from "../pages/CustomerPage";
import { uniqueName } from "../../../fixtures/testData";

test("finds a newly created customer via the navbar global search", async ({ page }) => {
  const customerName = uniqueName("QA-Search-Customer");
  await new CustomerPage(page).createCustomer(customerName);

  await page.goto("/desk");
  await page.click("#search-widget-button");
  const searchInput = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
  await searchInput.pressSequentially(customerName, { delay: 30 });
  await expect(page.getByText(customerName).first()).toBeVisible({ timeout: 10_000 });
});
