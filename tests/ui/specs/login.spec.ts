import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Login", () => {
  test("logs in with valid credentials", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(process.env.ADMIN_USER ?? "Administrator", process.env.ADMIN_PASSWORD ?? "admin");
    await login.expectLoggedIn();
  });

  test("rejects invalid credentials", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs("Administrator", "wrong-password");
    await login.expectLoginError();
  });
});
