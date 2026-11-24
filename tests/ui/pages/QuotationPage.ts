import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class QuotationPage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Quotation");
  }

  async createQuotation(customerName: string, itemCode: string, qty: number, rate = 100) {
    await this.gotoNew();
    await this.fillLink("party_name", customerName);
    await this.fillChildField("items", "item_code", itemCode, true);
    await this.fillChildField("items", "qty", String(qty));
    await this.fillChildField("items", "rate", String(rate));
    await this.save();
    await this.submit();
  }

  async createSalesOrder() {
    await this.createFrom("Sales Order");
  }
}
