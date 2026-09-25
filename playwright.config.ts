import { defineConfig, devices, type ReporterDescription } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";
const ci = Boolean(process.env.CI);
// CI runs the suite against the production build (the workflow runs `npm run build` first): routes are
// prebuilt as they deploy, instead of compiled on first request by the dev server, whose compile time made
// test durations depend on the runner. Locally the dev server is the default; ORTUS_E2E_SERVER=production
// runs against an existing `npm run build`.
const productionServer = ci || process.env.ORTUS_E2E_SERVER === "production";

const reporter: ReporterDescription[] = [
  ["list"],
  // In CI, annotations on the check run name every failed or flaky test, readable without the job logs.
  ...(ci ? [["github"] as ReporterDescription] : []),
  ["html", { open: "never", outputFolder: "playwright-report" }]
];

export default defineConfig({
  testDir: "./tests/ui",
  outputDir: "test-results",
  fullyParallel: false,
  workers: 1,
  // In CI a failed test is retried once only so the report can tell a consistent failure from a flaky one;
  // a flaky result still fails the run, so nothing passes by being rerun until it is green.
  retries: ci ? 1 : 0,
  failOnFlakyTests: ci,
  forbidOnly: ci,
  timeout: 45_000,
  expect: {
    timeout: 7_500
  },
  reporter,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: `npm run ${productionServer ? "start" : "dev"} -- --hostname 127.0.0.1 --port 3000`,
    url: baseURL,
    reuseExistingServer: !ci,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
