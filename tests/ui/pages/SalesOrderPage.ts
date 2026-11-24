import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class SalesOrderPage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Sales Order");
  }

  async fillDeliveryDateIfRequired() {
    const dateField = this.page.locator('[data-fieldname="delivery_date"] input').first();
    if (await dateField.isVisible().catch(() => false)) {
      const value = (await dateField.inputValue()).trim();
      if (!value) {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const formatted = `${dd}-${mm}-${today.getFullYear()}`;
        await dateField.fill(formatted);
        await dateField.press("Escape");
      }
    }
  }

  async submitOrder() {
    await this.fillDeliveryDateIfRequired();
    await this.save();
    await this.submit();
  }

  async createSalesInvoice() {
    await this.createFrom("Sales Invoice");
  }

  async getGrandTotal(): Promise<string> {
    return (await this.page.locator('[data-fieldname="grand_total"] .control-value').first().innerText()).trim();
  }
}
