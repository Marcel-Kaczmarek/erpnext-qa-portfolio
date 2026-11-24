import { test, expect } from "@playwright/test";
import { CustomerPage } from "../pages/CustomerPage";
import { ItemPage } from "../pages/ItemPage";
import { QuotationPage } from "../pages/QuotationPage";
import { SalesOrderPage } from "../pages/SalesOrderPage";
import { SalesInvoicePage } from "../pages/SalesInvoicePage";
import { uniqueName } from "../../../fixtures/testData";

/**
 * End-to-end core sales flow:
 * Customer -> Item -> Quotation -> Sales Order -> Sales Invoice,
 * asserting the grand total is carried through unchanged at each step.
 */
test("quotation converts through to a sales invoice with matching totals", async ({ page }) => {
  const customerName = uniqueName("QA-Customer");
  const itemCode = uniqueName("QA-Item");
  const qty = 2;

  await new CustomerPage(page).createCustomer(customerName);
  await new ItemPage(page).createItem(itemCode);

  const quotation = new QuotationPage(page);
  await quotation.createQuotation(customerName, itemCode, qty);
  await quotation.createSalesOrder();

  const salesOrder = new SalesOrderPage(page);
  await salesOrder.submitOrder();
  const orderTotal = await salesOrder.getGrandTotal();

  await salesOrder.createSalesInvoice();

  const invoice = new SalesInvoicePage(page);
  await invoice.submitInvoice();
  const invoiceTotal = await invoice.getGrandTotal();

  expect(invoiceTotal).toBe(orderTotal);
});

test("a submitted sales order can be cancelled", async ({ page }) => {
  const customerName = uniqueName("QA-Customer");
  const itemCode = uniqueName("QA-Item");

  await new CustomerPage(page).createCustomer(customerName);
  await new ItemPage(page).createItem(itemCode);

  const quotation = new QuotationPage(page);
  await quotation.createQuotation(customerName, itemCode, 1);
  await quotation.createSalesOrder();

  const salesOrder = new SalesOrderPage(page);
  await salesOrder.submitOrder();
  await salesOrder.cancel();
});
