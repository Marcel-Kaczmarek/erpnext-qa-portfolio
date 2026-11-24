import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class CustomerPage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Customer");
  }

  async createCustomer(customerName: string) {
    await this.gotoNew();
    await this.fillText("customer_name", customerName);
    await this.save();
  }

  async gotoList() {
    await this.page.goto("/desk/customer");
  }

  listRow(customerName: string) {
    return this.page.locator(".list-row", { hasText: customerName }).first();
  }
}
