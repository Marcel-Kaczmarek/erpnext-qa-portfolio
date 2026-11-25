/**
 * One-off asset generation script (not part of the test suite):
 * populates realistic synthetic business data in the local ERPNext
 * instance and captures the application screenshots used in README.md.
 * Run manually: node scripts/capture-screenshots.js
 */
const { chromium } = require("@playwright/test");
const path = require("path");

const BASE_URL = "http://localhost:8080";
const OUT = path.join(__dirname, "..", "docs", "screenshots", "application");
const VIEWPORT = { width: 1440, height: 900 };

async function shot(page, name) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, name) });
  console.log("captured", name);
}

async function fillLink(page, fieldname, value) {
  const input = page.locator(`[data-fieldname="${fieldname}"] input`).first();
  await input.click();
  await input.pressSequentially(value, { delay: 25 });
  const option = page.locator('[role="option"]').filter({ hasText: value }).first();
  await option.waitFor({ timeout: 10_000 });
  await option.click();
}

async function fillChildField(page, tableFieldname, columnFieldname, value, isLink = false) {
  const row = page.locator(`[data-fieldname="${tableFieldname}"] .grid-body .rows .grid-row`).last();
  await row.locator(`[data-fieldname="${columnFieldname}"]`).first().click();
  const input = row.locator(`input[data-fieldname="${columnFieldname}"]`).first();
  await input.click();
  if (isLink) {
    await input.pressSequentially(value, { delay: 25 });
    const option = page.locator('[role="option"]').filter({ hasText: value }).first();
    await option.waitFor({ timeout: 10_000 });
    await option.click();
  } else {
    await input.fill(value);
    await input.press("Escape");
  }
}

async function dismissToasts(page) {
  const closeButtons = page.locator(".es-toast__close");
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    await closeButtons.nth(i).click({ timeout: 1000 }).catch(() => {});
  }
}

async function save(page) {
  await dismissToasts(page);
  await page.keyboard.press("Control+S");
  await page.locator(".es-toast__message").filter({ hasText: "Saved" }).first().waitFor({ timeout: 10_000 });
}

async function submit(page) {
  await page.locator("button:visible", { hasText: "Submit" }).first().click();
  await page.click("div.modal.show button:has-text('Yes')");
  await page.locator("button:visible", { hasText: "Cancel" }).first().waitFor({ timeout: 20_000 });
  await page.waitForTimeout(500);
}

async function createFrom(page, menuLabel) {
  await page.locator("button:visible", { hasText: "Create" }).first().click();
  await page.getByRole("menuitem", { name: menuLabel }).click();
  await page.locator(".page-title", { hasText: menuLabel }).first().waitFor({ timeout: 15_000 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await run(page);
  } catch (err) {
    await page.screenshot({ path: path.join(__dirname, "capture-error.png"), fullPage: true }).catch(() => {});
    console.error("FAILED at:", page.url());
    throw err;
  } finally {
    await browser.close();
  }
})();

async function run(page) {
  // --- Login ---
  await page.goto(`${BASE_URL}/login`);
  await page.fill("#login_email", "Administrator");
  await page.fill("#login_password", "admin");
  await page.click("button:has-text('Continue')");
  await page.waitForURL(/\/desk/, { timeout: 20_000 });

  // --- Dashboard / home ---
  await page.goto(`${BASE_URL}/desk/home`);
  await page.waitForTimeout(1500);
  await shot(page, "01-dashboard.png");

  // --- Sales workspace ---
  await page.goto(`${BASE_URL}/desk/selling`);
  await page.waitForTimeout(1500);
  await shot(page, "02-sales-workspace.png");

  // --- Realistic business data ---
  const customerName = "Contoso Retail Ltd";
  const itemCode = "LAPTOP-DELL-XPS15";
  const employeeFirstName = "Sarah";

  // Customer creation
  await page.goto(`${BASE_URL}/desk/customer/new`);
  await page.waitForSelector(".page-title");
  await page.fill('[data-fieldname="customer_name"] input', customerName);
  await page.locator('[data-fieldname="customer_name"] input').blur();
  await save(page);
  await shot(page, "03-customer-creation.png");

  // Customer list
  await page.goto(`${BASE_URL}/desk/customer`);
  await page.waitForTimeout(1200);
  await shot(page, "04-customer-list.png");

  // Item creation
  await page.goto(`${BASE_URL}/desk/item/new`);
  await page.waitForSelector(".page-title");
  await page.fill('[data-fieldname="item_code"] input', itemCode);
  await fillLink(page, "item_group", "All Item Groups");
  await page.fill('[data-fieldname="standard_rate"] input', "1899");
  await page.locator('[data-fieldname="standard_rate"] input').blur();
  await save(page);
  await shot(page, "05-item-creation.png");

  // Item list
  await page.goto(`${BASE_URL}/desk/item`);
  await page.waitForTimeout(1200);
  await shot(page, "06-item-list.png");

  // Quotation creation (unsaved, data entered)
  await page.goto(`${BASE_URL}/desk/quotation/new`);
  await page.waitForSelector(".page-title");
  await fillLink(page, "party_name", customerName);
  await page.waitForTimeout(1500); // let the customer-change re-render (price list/currency) settle
  await fillChildField(page, "items", "item_code", itemCode, true);
  await fillChildField(page, "items", "qty", "5");
  await fillChildField(page, "items", "rate", "1899");
  await shot(page, "07-quotation-creation.png");

  // Submit quotation
  await save(page);
  await submit(page);
  await shot(page, "08-quotation-submitted.png");

  // Sales Order from quotation
  await createFrom(page, "Sales Order");
  const dateField = page.locator('[data-fieldname="delivery_date"] input').first();
  if (await dateField.isVisible().catch(() => false)) {
    const value = (await dateField.inputValue()).trim();
    if (!value) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      await dateField.fill(`${dd}-${mm}-${d.getFullYear()}`);
      await dateField.press("Escape");
    }
  }
  await shot(page, "09-sales-order-creation.png");

  await save(page);
  await submit(page);
  await shot(page, "10-sales-order-submitted.png");

  // Sales Invoice from sales order
  await createFrom(page, "Sales Invoice");
  await shot(page, "11-sales-invoice-creation.png");

  await save(page);
  await submit(page);
  await shot(page, "12-sales-invoice-submitted.png");

  // Employee management
  await page.goto(`${BASE_URL}/desk/employee/new`);
  await page.waitForSelector(".page-title");
  await page.fill('[data-fieldname="first_name"] input', employeeFirstName);
  await page.fill('[data-fieldname="date_of_joining"] input', "01-03-2024");
  await page.locator('[data-fieldname="date_of_joining"] input').press("Escape");
  await page.fill('[data-fieldname="date_of_birth"] input', "14-07-1994");
  await page.locator('[data-fieldname="date_of_birth"] input').press("Escape");
  await fillLink(page, "gender", "Female");
  await save(page);
  await shot(page, "13-employee-creation.png");

  await page.goto(`${BASE_URL}/desk/employee`);
  await page.waitForTimeout(1200);
  await shot(page, "14-employee-list.png");

  // Global search
  await page.goto(`${BASE_URL}/desk`);
  await page.waitForTimeout(800);
  await page.click("#search-widget-button");
  const searchInput = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
  await searchInput.pressSequentially("Contoso", { delay: 30 });
  await page.waitForTimeout(1200);
  await shot(page, "15-global-search.png");
  await page.keyboard.press("Escape");

  // Form validation error
  await page.goto(`${BASE_URL}/desk/customer/new`);
  await page.waitForSelector(".page-title");
  await page.keyboard.press("Control+S");
  await page.waitForTimeout(1200);
  await shot(page, "16-form-validation-error.png");

  console.log("All screenshots captured.");
}
