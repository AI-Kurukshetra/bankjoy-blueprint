import { defineConfig } from "@playwright/test";

const nodePath = `${process.env.HOME}/.volta/tools/image/node/22.12.0/bin`;
const nodeBin = `${process.env.HOME}/.volta/tools/image/node/22.12.0/bin/node`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3002",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      `export NEXT_PUBLIC_SUPABASE_URL=""; ` +
      `export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""; ` +
      `export PATH="${nodePath}:$PATH"; ` +
      `${nodeBin} node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3002`,
    url: "http://127.0.0.1:3002/login",
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
