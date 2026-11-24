import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class SalesInvoicePage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Sales Invoice");
  }

  async submitInvoice() {
    await this.save();
    await this.submit();
  }

  async getGrandTotal(): Promise<string> {
    return (await this.page.locator('[data-fieldname="grand_total"] .control-value').first().innerText()).trim();
  }
}
