import { Page, expect } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async loginAs(email: string, password: string) {
    await this.page.fill("#login_email", email);
    await this.page.fill("#login_password", password);
    await this.page.click("button:has-text('Continue')");
  }

  async expectLoginError() {
    await expect(this.page.locator("text=Invalid credentials").first()).toBeVisible();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/desk/);
  }
}
