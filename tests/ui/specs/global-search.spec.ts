import { test, expect } from "@playwright/test";

/**
 * frappe.utils.global_search queues index updates on save (Redis
 * `global_search_queue`) but only flushes them into the queryable
 * `__global_search` table via a 15-minute cron
 * (frappe.utils.global_search.sync_global_search — see frappe/hooks.py's
 * scheduler_events). There is no HTTP-whitelisted way to force an
 * earlier flush. A record created moments ago is therefore *not*
 * reliably searchable within any test-suite-scale timeout — that would
 * be testing the cron's cadence, not the search feature.
 *
 * This test verifies search correctness (it returns the right,
 * already-indexed record) against a Customer that already exists from
 * prior activity on this instance, rather than one this test just
 * created. See docs/qa/exploratory-testing-report.md (EXP-02/EXP-09)
 * and docs/bug-reports/DEFECT-001 for how this was discovered.
 *
 * The assertion is made on the actual
 * frappe.utils.global_search.search API response (captured via
 * page.waitForResponse), not on rendered DOM text — the quick palette's
 * UI (virtualized suggestion list, fuzzy command-matching rows that
 * echo the typed query) proved too fragile to assert on directly (see
 * EXP-01).
 */
test("global search finds an existing customer by name", async ({ page }) => {
  const listResp = await page.request.get(
    "/api/resource/Customer?limit_page_length=1&order_by=creation+asc&fields=" +
      encodeURIComponent('["customer_name"]'),
  );
  expect(listResp.ok()).toBeTruthy();
  const { data } = await listResp.json();
  expect(data.length).toBeGreaterThan(0);
  const customerName: string = data[0].customer_name;

  await page.goto("/desk");
  await page.click("#search-widget-button");
  const searchInput = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
  await searchInput.pressSequentially(customerName, { delay: 30 });

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("frappe.utils.global_search.search")),
    // The quick palette (Ctrl+K) fuzzy-matches commands/reports first and
    // always echoes the typed text back in a "Search for <query>" row;
    // clicking it is what actually triggers the real search API call.
    page.locator("text=Search for").first().click(),
  ]);

  expect(response.ok()).toBeTruthy();
  const { message: results } = await response.json();
  expect(results.some((r: { doctype: string; name: string }) => r.doctype === "Customer" && r.name === customerName)).toBe(
    true,
  );
});
