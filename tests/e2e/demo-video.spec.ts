import { expect, test, type Page } from "@playwright/test";

function getFutureDate(daysAhead = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

async function waitForDemoBeat(page: Page, delay = 1200) {
  await page.waitForTimeout(delay);
}

async function ensureCaptionLayer(page: Page) {
  await page.evaluate(() => {
    const existing = document.getElementById("demo-caption-root");

    if (existing) {
      return;
    }

    const root = document.createElement("div");
    root.id = "demo-caption-root";
    root.innerHTML = `
      <div id="demo-caption-panel">
        <p id="demo-caption-kicker">Bankjoy demo</p>
        <h2 id="demo-caption-title"></h2>
        <p id="demo-caption-body"></p>
      </div>
    `;

    Object.assign(root.style, {
      position: "fixed",
      left: "40px",
      right: "40px",
      bottom: "36px",
      zIndex: "2147483647",
      pointerEvents: "none",
      display: "flex",
      justifyContent: "center",
    });

    const panel = root.querySelector("#demo-caption-panel");

    if (panel instanceof HTMLElement) {
      Object.assign(panel.style, {
        width: "min(1240px, 100%)",
        borderRadius: "30px",
        padding: "24px 30px",
        background: "rgba(10, 18, 30, 0.82)",
        color: "#f8fbff",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.28)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px)",
        fontFamily:
          '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      });
    }

    const kicker = root.querySelector("#demo-caption-kicker");
    const title = root.querySelector("#demo-caption-title");
    const body = root.querySelector("#demo-caption-body");

    if (kicker instanceof HTMLElement) {
      Object.assign(kicker.style, {
        margin: "0 0 10px 0",
        fontSize: "13px",
        textTransform: "uppercase",
        letterSpacing: "0.24em",
        color: "rgba(255,255,255,0.66)",
      });
    }

    if (title instanceof HTMLElement) {
      Object.assign(title.style, {
        margin: "0",
        fontSize: "34px",
        lineHeight: "1.15",
        fontWeight: "700",
      });
    }

    if (body instanceof HTMLElement) {
      Object.assign(body.style, {
        margin: "12px 0 0 0",
        fontSize: "20px",
        lineHeight: "1.5",
        color: "rgba(255,255,255,0.84)",
      });
    }

    document.body.append(root);

    const devToolsButton = Array.from(document.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Open Next.js Dev Tools"),
    );

    if (devToolsButton instanceof HTMLElement) {
      devToolsButton.style.display = "none";
    }
  });
}

async function showCaption(page: Page, title: string, body: string, delay = 2200) {
  await ensureCaptionLayer(page);
  await page.evaluate(
    ({ nextTitle, nextBody }) => {
      const titleNode = document.getElementById("demo-caption-title");
      const bodyNode = document.getElementById("demo-caption-body");

      if (titleNode) {
        titleNode.textContent = nextTitle;
      }

      if (bodyNode) {
        bodyNode.textContent = nextBody;
      }
    },
    { nextTitle: title, nextBody: body },
  );
  await waitForDemoBeat(page, delay);
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await showCaption(
    page,
    "Welcome to Bankjoy",
    "Let me walk you through the customer and admin experience using realistic banking data in one live product demo.",
    3200,
  );
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await waitForDemoBeat(page, 800);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("recorded walkthrough covers member and admin journeys", async ({ page }) => {
  const scheduledDate = getFutureDate(2);
  const transferMemo = `Demo walkthrough transfer ${Date.now()}`;
  const externalTransferMemo = `External walkthrough transfer ${Date.now()}`;
  const scheduledTransferMemo = `Scheduled walkthrough transfer ${Date.now()}`;
  const payeeName = `Demo Internet ${Date.now()}`;

  await login(page, "member.demo@example.com", "DemoPass123!");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "A clearer view of your money." })).toBeVisible();
  await showCaption(
    page,
    "Customer dashboard",
    "This home screen gives customers a fast view of account balances, recent activity, and important account updates.",
    3000,
  );
  await page.getByRole("heading", { name: "Notifications" }).scrollIntoViewIfNeeded();
  await showCaption(
    page,
    "Recent account alerts",
    "Notifications help customers stay aware of transfers, payments, and account events without leaving the dashboard.",
    2600,
  );

  await page.getByRole("link", { name: "Accounts" }).click();
  await expect(page).toHaveURL(/\/dashboard\/accounts$/);
  await expect(page.getByRole("heading", { name: "Account details and statements" })).toBeVisible();
  await showCaption(
    page,
    "Accounts and statements",
    "From here, customers can review each account, check balances, see recent transactions, and access statement history.",
    3000,
  );

  await page.getByRole("heading", { name: "Download history" }).first().scrollIntoViewIfNeeded();
  await showCaption(
    page,
    "Statement center",
    "Statement records are organized by account and period, making it easy to find the right document quickly.",
    2400,
  );

  await page.getByLabel("Financial institution").fill("North Harbor Bank");
  await page.getByLabel("Account nickname").fill("Walkthrough checking");
  await page.getByLabel("Routing number").fill("021000021");
  await page.getByLabel("Account number").fill("9876543210");
  await showCaption(
    page,
    "External account linking",
    "Customers can link outside accounts so money movement across institutions can happen from the same experience.",
    2500,
  );
  await page.getByRole("button", { name: "Link external account" }).click();
  await expect(page.getByText("External account linked.")).toBeVisible();
  await waitForDemoBeat(page, 1800);

  await page.getByRole("link", { name: "Download statement" }).first().scrollIntoViewIfNeeded();
  await showCaption(
    page,
    "Statement delivery",
    "Customers can download statements directly from the account workspace whenever they need a record.",
    2300,
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download statement" }).first().click();
  await downloadPromise;
  await waitForDemoBeat(page, 1600);

  await page.getByRole("link", { name: "Transfers" }).click();
  await expect(page).toHaveURL(/\/dashboard\/transfers$/);
  await expect(page.getByRole("heading", { name: "Transfer funds" })).toBeVisible();
  await showCaption(
    page,
    "Transfer control center",
    "Bankjoy supports internal transfers, linked external transfers, and scheduled movement from one guided workflow.",
    3000,
  );
  await page.locator('select[name="transferRail"]').selectOption("internal");
  await page.locator('select[name="toAccountId"]').selectOption({ index: 1 });
  await page.getByLabel("Amount").fill("25.50");
  await page.getByLabel("Memo").fill(transferMemo);
  await showCaption(
    page,
    "Internal transfer",
    "Here is a simple internal transfer between customer accounts, with the result posted immediately into activity history.",
    2600,
  );
  await page.getByRole("button", { name: "Confirm transfer" }).click();
  await expect(page.getByText("Transfer completed successfully. Your account activity has been updated.")).toBeVisible();
  await waitForDemoBeat(page, 1800);

  await page.locator('select[name="transferRail"]').selectOption("external");
  await page.locator('select[name="externalAccountId"]').selectOption({ index: 0 });
  await page.getByLabel("Amount").fill("40.00");
  await page.getByLabel("Memo").fill(externalTransferMemo);
  await showCaption(
    page,
    "External transfer flow",
    "External transfers are clearly separated and can move into review before final processing, which is more realistic for outbound rails.",
    2800,
  );
  await page.getByRole("button", { name: "Confirm transfer" }).click();
  await expect(page.getByText("External transfer submitted. It is now pending review.")).toBeVisible();
  await waitForDemoBeat(page, 1800);

  await page.locator('select[name="transferRail"]').selectOption("internal");
  await page.locator('select[name="toAccountId"]').selectOption({ index: 1 });
  await page.getByLabel("Amount").fill("60.00");
  await page.getByLabel("Memo").fill(scheduledTransferMemo);
  await page.getByLabel("Schedule for later").fill(scheduledDate);
  await showCaption(
    page,
    "Scheduled transfer",
    "Future-dated transfers appear in activity before settlement, so customers can see what is coming next.",
    2600,
  );
  await page.getByRole("button", { name: "Confirm transfer" }).click();
  await expect(page.getByText("Transfer scheduled successfully. It now appears in your transfer activity.")).toBeVisible();
  await waitForDemoBeat(page, 1800);

  await page.getByRole("link", { name: "Payments" }).click();
  await expect(page).toHaveURL(/\/dashboard\/payments$/);
  await showCaption(
    page,
    "Bill payments",
    "Customers can schedule upcoming bills and keep outgoing payment activity alongside the rest of their banking workflow.",
    2800,
  );
  await page.getByLabel("Payee").fill(payeeName);
  await page.getByLabel("Category").fill("Utilities");
  await page.getByLabel("Amount").fill("79.99");
  await page.getByLabel("Deliver by").fill(scheduledDate);
  await page.getByLabel("Memo").fill("Walkthrough scheduled payment");
  await page.getByRole("button", { name: "Schedule bill payment" }).click();
  await expect(page.getByText("Bill payment scheduled.")).toBeVisible();
  await waitForDemoBeat(page, 1800);

  await page.getByRole("link", { name: "Transactions" }).click();
  await expect(page).toHaveURL(/\/dashboard\/transactions$/);
  await showCaption(
    page,
    "Searchable transaction history",
    "Transaction history can be filtered by merchant, category, or notes so customers can find activity quickly.",
    2800,
  );
  await page.getByPlaceholder("Search merchants, categories, or notes").fill("Payroll");
  await expect(page.getByText("Monthly direct deposit").last()).toBeVisible();
  await waitForDemoBeat(page, 1600);
  await page.getByPlaceholder("Search merchants, categories, or notes").fill("zzzz-no-match");
  await expect(page.getByText("No transactions match your search.")).toBeVisible();
  await showCaption(
    page,
    "Empty-state feedback",
    "Even empty searches return clear feedback instead of blank space, which makes the experience easier to trust.",
    2400,
  );
  await page.getByPlaceholder("Search merchants, categories, or notes").fill("Grocery");
  await expect(page.getByText("Fresh Market").last()).toBeVisible();
  await waitForDemoBeat(page, 1400);

  await page.getByRole("link", { name: "Security" }).click();
  await expect(page).toHaveURL(/\/dashboard\/security$/);
  await expect(page.getByText("MFA setup requires a live Supabase-authenticated session.")).toBeVisible();
  await showCaption(
    page,
    "Security center",
    "Customers also have a dedicated security center for stronger controls, including MFA in live authenticated sessions.",
    2800,
  );

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await waitForDemoBeat(page, 1400);

  await login(page, "admin.demo@example.com", "DemoPass123!");
  await expect(page).toHaveURL(/\/dashboard$/);
  await showCaption(
    page,
    "Admin experience",
    "Now we switch into the operator view, where teams can monitor customer activity and platform alerts.",
    2800,
  );

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/\/dashboard\/admin$/);
  await expect(page.getByRole("heading", { name: "Operations monitor" })).toBeVisible();
  await showCaption(
    page,
    "Operations monitoring",
    "Admins can review prioritized alerts, identity records, and cross-user activity from one operations console.",
    3200,
  );

  await page.goto("/dashboard/admin/emails");
  await expect(page.getByRole("heading", { name: "Email templates" })).toBeVisible();
  await showCaption(
    page,
    "Operational email previews",
    "The admin side also includes branded email previews for authentication, security notices, transfers, and statement delivery.",
    3400,
  );

  await showCaption(
    page,
    "End-to-end banking demo",
    "In one product, Bankjoy delivers customer banking journeys and admin monitoring with realistic data and guided workflows.",
    3600,
  );
});
