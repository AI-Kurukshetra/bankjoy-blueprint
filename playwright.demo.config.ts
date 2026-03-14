import { defineConfig } from "@playwright/test";

const nodePath = `${process.env.HOME}/.volta/tools/image/node/22.12.0/bin`;
const nodeBin = `${process.env.HOME}/.volta/tools/image/node/22.12.0/bin/node`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /demo-video\.spec\.ts/,
  timeout: 180_000,
  expect: {
    timeout: 20_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "test-results/demo-video",
  use: {
    baseURL: "http://127.0.0.1:3002",
    browserName: "chromium",
    headless: false,
    trace: "off",
    screenshot: "off",
    video: {
      mode: "on",
      size: {
        width: 1920,
        height: 1080,
      },
    },
    viewport: {
      width: 1920,
      height: 1080,
    },
    launchOptions: {
      args: ["--force-device-scale-factor=1"],
      slowMo: 500,
    },
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
