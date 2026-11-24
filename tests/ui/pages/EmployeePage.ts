import { Page } from "@playwright/test";
import { BaseFormPage } from "./BaseFormPage";

export class EmployeePage extends BaseFormPage {
  constructor(page: Page) {
    super(page, "Employee");
  }

  async createEmployee(firstName: string, dateOfJoining: string, dateOfBirth: string, gender: string) {
    await this.gotoNew();
    await this.fillText("first_name", firstName);
    await this.fillDate("date_of_joining", dateOfJoining);
    await this.fillDate("date_of_birth", dateOfBirth);
    await this.fillLink("gender", gender);
    await this.save();
  }

  async gotoList() {
    await this.page.goto("/desk/employee");
  }

  listRow(employeeName: string) {
    return this.page.locator(".list-row", { hasText: employeeName }).first();
  }
}
