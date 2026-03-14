import { expect, test, type Page } from "@playwright/test";

function getFutureDate(daysAhead = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("demo member flow covers core banking journeys", async ({ page }) => {
  const scheduledDate = getFutureDate();
  const transferMemo = `Demo browser transfer ${Date.now()}`;
  const payeeName = `Demo Utilities ${Date.now()}`;

  await login(page, "member.demo@example.com");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "A clearer view of your money." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByText("Transaction posted").first()).toBeVisible();

  await page.getByRole("link", { name: "Accounts" }).click();
  await expect(page).toHaveURL(/\/dashboard\/accounts$/);
  await expect(page.getByRole("heading", { name: "Account details and statements" })).toBeVisible();

  await page.getByLabel("Financial institution").fill("North Harbor Bank");
  await page.getByLabel("Account nickname").fill("Browser checking");
  await page.getByLabel("Routing number").fill("021000021");
  await page.getByLabel("Account number").fill("9876543210");
  await page.getByRole("button", { name: "Link external account" }).click();

  await expect(page.getByText("External account linked.")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download statement" }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.csv$/);

  await page.getByRole("link", { name: "Transfers" }).click();
  await expect(page).toHaveURL(/\/dashboard\/transfers$/);
  await expect(page.getByRole("heading", { name: "Internal, external, and scheduled transfers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transfer funds" })).toBeVisible();
  await page.getByRole("heading", { name: "Transfer funds" }).scrollIntoViewIfNeeded();

  await page.locator('select[name="transferRail"]').selectOption("internal");
  await page.locator('select[name="toAccountId"]').selectOption({ index: 1 });
  await page.getByLabel("Amount").fill("25.50");
  await page.getByLabel("Memo").fill(transferMemo);
  await page.getByRole("button", { name: "Confirm transfer" }).click();

  await expect(page.getByText("Transfer completed successfully. Your account activity has been updated.")).toBeVisible();
  await expect(page.getByText(transferMemo)).toBeVisible();
  await expect(page.getByText("Transfer update").first()).toBeVisible();

  await page.getByRole("link", { name: "Payments" }).click();
  await expect(page).toHaveURL(/\/dashboard\/payments$/);
  await expect(page.getByRole("heading", { name: "Schedule and track outgoing payments" })).toBeVisible();

  await page.getByLabel("Payee").fill(payeeName);
  await page.getByLabel("Category").fill("Utilities");
  await page.getByLabel("Amount").fill("79.99");
  await page.getByLabel("Deliver by").fill(scheduledDate);
  await page.getByLabel("Memo").fill("Browser scheduled bill");
  await page.getByRole("button", { name: "Schedule bill payment" }).click();

  await expect(page.getByText("Bill payment scheduled.")).toBeVisible();
  await expect(page.getByText(payeeName).first()).toBeVisible();
  await expect(page.getByText("Bill payment scheduled").first()).toBeVisible();

  await page.getByRole("link", { name: "Transactions" }).click();
  await expect(page).toHaveURL(/\/dashboard\/transactions$/);
  await expect(page.getByRole("heading", { name: "Transaction history" })).toBeVisible();

  const searchInput = page.getByPlaceholder("Search merchants, categories, or notes");
  await searchInput.fill("Payroll");
  await expect(page.getByText("Monthly direct deposit").last()).toBeVisible();
  await expect(page.getByText("Merchant").first()).toBeVisible();
  await expect(page.getByText("Payroll").last()).toBeVisible();

  await searchInput.fill("zzzz-no-match");
  await expect(page.getByText("No transactions match your search.")).toBeVisible();

  await searchInput.fill("Grocery");
  await expect(page.getByText("Fresh Market").last()).toBeVisible();

  await page.getByRole("link", { name: "Security" }).click();
  await expect(page).toHaveURL(/\/dashboard\/security$/);
  await expect(page.getByText("MFA setup requires a live Supabase-authenticated session.")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("demo admin flow exposes operations monitor", async ({ page }) => {
  await login(page, "admin.demo@example.com");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/\/dashboard\/admin$/);
  await expect(page.getByRole("heading", { name: "Operations monitor" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Triage queue" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identity registry" })).toBeVisible();
});
