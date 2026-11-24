import { Page, expect } from "@playwright/test";

/**
 * Shared helpers for Frappe desk form pages (new-doc, field entry, save, submit).
 * Doctype-specific pages extend this instead of re-implementing the same
 * form interactions for every doctype.
 */
export class BaseFormPage {
  constructor(protected readonly page: Page, private readonly doctype: string) {}

  async gotoNew() {
    const route = this.doctype.toLowerCase().replace(/ /g, "-");
    await this.page.goto(`/desk/${route}/new`);
    await this.page.waitForSelector(".page-title");
  }

  async fillText(fieldname: string, value: string) {
    const input = this.page.locator(`[data-fieldname="${fieldname}"] input`).first();
    await input.fill(value);
    await input.blur();
  }

  /** Accepts an ISO (YYYY-MM-DD) date and types it in this site's display format (DD-MM-YYYY). */
  async fillDate(fieldname: string, isoValue: string) {
    const [yyyy, mm, dd] = isoValue.split("-");
    const input = this.page.locator(`[data-fieldname="${fieldname}"] input`).first();
    await input.fill(`${dd}-${mm}-${yyyy}`);
    await input.press("Escape");
  }

  async fillLink(fieldname: string, value: string) {
    const input = this.page.locator(`[data-fieldname="${fieldname}"] input`).first();
    await input.click();
    await input.pressSequentially(value, { delay: 30 });
    const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
    await option.waitFor({ timeout: 10_000 });
    await option.click();
  }

  async save() {
    await this.dismissToasts();
    await this.page.keyboard.press("Control+S");
    await expect(this.page.locator(".es-toast__message").filter({ hasText: "Saved" }).first()).toBeVisible({
      timeout: 10_000,
    });
  }

  /** Closes any lingering toast so a subsequent save's toast can't be mistaken for a stale one. */
  private async dismissToasts() {
    const closeButtons = this.page.locator(".es-toast__close");
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons.nth(i).click({ timeout: 1_000 }).catch(() => {});
    }
  }

  /** Attempts a save without waiting for success — used by negative test cases. */
  async trySave() {
    await this.page.keyboard.press("Control+S");
  }

  /** A rejected save shows a "Missing Fields" dialog listing the mandatory fields. */
  async expectUnsaved() {
    await expect(this.page.locator(".modal-title", { hasText: "Missing Fields" }).first()).toBeVisible({
      timeout: 5_000,
    });
    await this.page.click(".modal.show button.btn-modal-close");
  }

  /**
   * Submitted-doc status text varies by doctype ("Open", "To Bill", …), so
   * detect success by the toolbar swapping its "Submit" action for "Cancel".
   */
  async submit() {
    await this.page.locator("button:visible", { hasText: "Submit" }).first().click();
    await this.page.click("div.modal.show button:has-text('Yes')");
    await expect(this.page.locator("button:visible", { hasText: "Cancel" }).first()).toBeVisible({ timeout: 10_000 });
  }

  async cancel() {
    await this.page.locator("button:visible", { hasText: "Cancel" }).first().click();
    await this.page.click("div.modal.show button:has-text('Yes')");
    await expect(this.page.locator("button:visible", { hasText: "Amend" }).first()).toBeVisible({ timeout: 10_000 });
  }

  async createFrom(menuLabel: string) {
    await this.page.locator("button:visible", { hasText: "Create" }).first().click();
    await this.page.getByRole("menuitem", { name: menuLabel }).click();
    await this.page.locator(".page-title", { hasText: menuLabel }).first().waitFor({ timeout: 15_000 });
  }

  async fillChildField(tableFieldname: string, columnFieldname: string, value: string, isLink = false) {
    const row = this.page.locator(`[data-fieldname="${tableFieldname}"] .grid-body .rows .grid-row`).last();
    await row.locator(`[data-fieldname="${columnFieldname}"]`).first().click();
    const input = row.locator(`input[data-fieldname="${columnFieldname}"]`).first();
    await input.click();
    if (isLink) {
      await input.pressSequentially(value, { delay: 30 });
      const option = this.page.locator('[role="option"]').filter({ hasText: value }).first();
      await option.waitFor({ timeout: 10_000 });
      await option.click();
    } else {
      await input.fill(value);
      await input.press("Escape");
    }
  }
}
