import { test, expect } from "@playwright/test";
import { CustomerPage } from "../pages/CustomerPage";
import { uniqueName } from "../../../fixtures/testData";

test("creates a new customer and finds it in the list view", async ({ page }) => {
  const customerName = uniqueName("QA-Customer");
  const customer = new CustomerPage(page);

  await customer.createCustomer(customerName);

  await customer.gotoList();
  await expect(customer.listRow(customerName)).toBeVisible();
});
