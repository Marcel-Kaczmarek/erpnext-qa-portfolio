import { test as setup } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

const authFile = "playwright/.auth/admin.json";

setup("authenticate as Administrator", async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.loginAs(process.env.ADMIN_USER ?? "Administrator", process.env.ADMIN_PASSWORD ?? "admin");

  await page.waitForURL(/\/desk|\/setup-wizard/, { timeout: 20_000 });

  if (page.url().includes("setup-wizard")) {
    await completeSetupWizard(page);
  }

  await login.expectLoggedIn();
  await page.context().storageState({ path: authFile });
});

/**
 * A freshly created site (e.g. a new CI run via pwd.yml) lands on the
 * one-time onboarding wizard instead of the desk. Completing it with
 * minimal defaults is a precondition for every other test, so it's
 * handled once here rather than duplicated per spec file.
 */
async function completeSetupWizard(page: import("@playwright/test").Page) {
  await page.click("button:has-text('Get Started')");
  await page.locator("select").nth(0).selectOption({ index: 1 });
  await page.click('input[type="checkbox"] >> nth=0');
  await page.click("button:has-text('Continue')");

  await page.fill('[data-fieldname="company_name"] input', "QA Portfolio Co");
  await page.fill('[data-fieldname="company_abbr"] input', "QPC");
  await page.click("button:has-text('Complete Setup')");

  await page.waitForURL(/\/desk/, { timeout: 120_000 });
}
