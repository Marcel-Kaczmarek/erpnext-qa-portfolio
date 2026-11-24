import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class ItemPage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Item");
  }

  async createItem(itemCode: string) {
    await this.gotoNew();
    await this.fillText("item_code", itemCode);
    await this.fillLink("item_group", "All Item Groups");
    await this.save();
  }
}
