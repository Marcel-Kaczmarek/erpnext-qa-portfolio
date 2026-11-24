import { test, expect } from "@playwright/test";
import { EmployeePage } from "../pages/EmployeePage";
import { uniqueName, pastDate } from "../../../fixtures/testData";

/**
 * HR flow: a second business domain alongside Sales, showing the Page
 * Object Model generalizes across unrelated doctypes without new
 * low-level code. Scoped to Employee (core ERPNext) — Leave Application
 * and Attendance live in the separate HRMS app, which isn't installed
 * here (see README: HRMS requires Frappe/ERPNext v17+, this stack runs
 * v16).
 */
test.describe("HR flow", () => {
  test("creates an employee and finds it in the list view", async ({ page }) => {
    const firstName = uniqueName("QA-Employee");
    const employee = new EmployeePage(page);

    await employee.createEmployee(firstName, pastDate(30), pastDate(365 * 25), "Male");

    await employee.gotoList();
    await expect(employee.listRow(firstName)).toBeVisible();
  });
});
