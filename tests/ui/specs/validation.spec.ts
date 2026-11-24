import { test, expect } from "@playwright/test";
import { CustomerPage } from "../pages/CustomerPage";
import { ItemPage } from "../pages/ItemPage";
import { QuotationPage } from "../pages/QuotationPage";
import { uniqueName } from "../../../fixtures/testData";

test.describe("Form validation", () => {
  test("rejects a customer saved without a name", async ({ page }) => {
    const customer = new CustomerPage(page);
    await customer.gotoNew();
    await customer.trySave();
    await customer.expectUnsaved();
  });

  test("rejects an item saved without an item code", async ({ page }) => {
    const item = new ItemPage(page);
    await item.gotoNew();
    await item.trySave();
    await item.expectUnsaved();
  });

  test("auto-suffixes a second customer created with a duplicate name", async ({ page }) => {
    // Unlike Item (item_code is a strict unique key), Customer allows a
    // duplicate customer_name and disambiguates it as "<name> - 1".
    const customerName = uniqueName("QA-Dup-Customer");
    const customer = new CustomerPage(page);
    await customer.createCustomer(customerName);

    await customer.gotoNew();
    await customer.fillText("customer_name", customerName);
    await customer.save();

    await expect(page).toHaveURL(new RegExp(`${customerName}.*-.*1`));
  });

  test("rejects a second item created with a duplicate item code", async ({ page }) => {
    const itemCode = uniqueName("QA-Dup-Item");
    const item = new ItemPage(page);
    await item.createItem(itemCode);

    await item.gotoNew();
    await item.fillText("item_code", itemCode);
    await item.trySave();
    await item.expectUnsaved();
  });

  test("rejects a quotation submitted with no line items", async ({ page }) => {
    const customerName = uniqueName("QA-NoItems-Customer");
    await new CustomerPage(page).createCustomer(customerName);

    const quotation = new QuotationPage(page);
    await quotation.gotoNew();
    await quotation.fillLink("party_name", customerName);
    await quotation.trySave();
    await quotation.expectUnsaved();
  });
});
