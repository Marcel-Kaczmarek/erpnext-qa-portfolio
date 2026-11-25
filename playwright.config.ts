import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"], ["allure-playwright", { resultsDir: "allure-results" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "unauthenticated",
      testMatch: /login\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      testIgnore: [/auth\.setup\.ts/, /login\.spec\.ts/],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
    },
  ],
});
