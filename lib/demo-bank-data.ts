import { cookies } from "next/headers";

import type { AppSession } from "@/lib/session";

const DEMO_TRANSFERS_COOKIE = "bankjoy-demo-transfers";
const DEMO_NOTIFICATIONS_COOKIE = "bankjoy-demo-notifications";
const DEMO_ADMIN_EVENTS_COOKIE = "bankjoy-demo-admin-events";
const DEMO_EXTERNAL_ACCOUNTS_COOKIE = "bankjoy-demo-external-accounts";
const DEMO_BILL_PAYMENTS_COOKIE = "bankjoy-demo-bill-payments";

export type Account = {
  id: string;
  name: string;
  type: string;
  mask: string;
  balanceCents: number;
  currency: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  merchantName: string;
  description: string;
  category: string;
  amountCents: number;
  direction: "credit" | "debit";
  status: "posted" | "pending";
  occurredAt: string;
};

export type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string | null;
  externalAccountId: string | null;
  transferRail: "internal" | "external";
  amountCents: number;
  memo: string;
  status: "completed" | "pending_review" | "scheduled";
  scheduledFor: string | null;
  processedAt: string | null;
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  kind: "transaction" | "security";
  createdAt: string;
};

export type AdminEvent = {
  id: string;
  kind: "security" | "transfer" | "payment" | "profile" | "system";
  label: string;
  detail: string;
  createdAt: string;
  severity: "info" | "high";
};

export type StatementSummary = {
  id: string;
  accountId: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  openingBalanceCents: number;
  closingBalanceCents: number;
  format: "csv";
  status: "available";
  fileName: string;
  generatedAt: string;
};

export type ExternalAccount = {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: "checking" | "savings" | "credit" | "loan" | "investment";
  status: "linked" | "pending_review";
  routingMask: string;
  accountMask: string;
  createdAt: string;
  lastSyncAt: string;
};

export type BillPayment = {
  id: string;
  fromAccountId: string;
  payeeName: string;
  payeeCategory: string;
  amountCents: number;
  status: "scheduled" | "processing" | "paid";
  deliverBy: string;
  memo: string;
  processedAt: string | null;
  createdAt: string;
};

export type BankingSnapshot = {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];
  externalAccounts: ExternalAccount[];
  notifications: Notification[];
  adminEvents: AdminEvent[];
};

const baseAccounts: Account[] = [
  {
    id: "chk-001",
    name: "Primary Checking",
    type: "Checking",
    mask: "•••• 1024",
    balanceCents: 582340,
    currency: "USD",
  },
  {
    id: "sav-001",
    name: "Rainy Day Savings",
    type: "Savings",
    mask: "•••• 8831",
    balanceCents: 1289040,
    currency: "USD",
  },
];

const baseTransactions: Transaction[] = [
  {
    id: "txn-001",
    accountId: "chk-001",
    merchantName: "Fresh Market",
    description: "Grocery refill",
    category: "Groceries",
    amountCents: 8425,
    direction: "debit",
    status: "posted",
    occurredAt: "2026-03-14T08:40:00.000Z",
  },
  {
    id: "txn-002",
    accountId: "chk-001",
    merchantName: "Payroll",
    description: "Monthly direct deposit",
    category: "Income",
    amountCents: 184500,
    direction: "credit",
    status: "posted",
    occurredAt: "2026-03-13T12:15:00.000Z",
  },
  {
    id: "txn-003",
    accountId: "chk-001",
    merchantName: "City Power",
    description: "Utility autopay",
    category: "Utilities",
    amountCents: 12990,
    direction: "debit",
    status: "posted",
    occurredAt: "2026-03-12T04:45:00.000Z",
  },
  {
    id: "txn-004",
    accountId: "sav-001",
    merchantName: "Internal Transfer",
    description: "Savings contribution",
    category: "Transfer",
    amountCents: 45000,
    direction: "credit",
    status: "posted",
    occurredAt: "2026-03-10T18:00:00.000Z",
  },
  {
    id: "txn-005",
    accountId: "chk-001",
    merchantName: "Metro Transit",
    description: "Transit top-up",
    category: "Transport",
    amountCents: 2200,
    direction: "debit",
    status: "pending",
    occurredAt: "2026-03-14T09:15:00.000Z",
  },
];

const baseTransfers: Transfer[] = [
  {
    id: "trf-001",
    fromAccountId: "chk-001",
    toAccountId: "sav-001",
    externalAccountId: null,
    transferRail: "internal",
    amountCents: 45000,
    memo: "Automatic weekly savings",
    status: "completed",
    scheduledFor: null,
    processedAt: "2026-03-10T18:00:00.000Z",
    createdAt: "2026-03-10T18:00:00.000Z",
  },
  {
    id: "trf-002",
    fromAccountId: "chk-001",
    toAccountId: null,
    externalAccountId: "ext-001",
    transferRail: "external",
    amountCents: 32500,
    memo: "Home repair reserve",
    status: "pending_review",
    scheduledFor: null,
    processedAt: null,
    createdAt: "2026-03-14T04:15:00.000Z",
  },
  {
    id: "trf-003",
    fromAccountId: "chk-001",
    toAccountId: null,
    externalAccountId: "ext-001",
    transferRail: "external",
    amountCents: 54000,
    memo: "Scheduled vendor payment",
    status: "scheduled",
    scheduledFor: "2026-03-16",
    processedAt: null,
    createdAt: "2026-03-14T09:25:00.000Z",
  },
];

const baseNotifications: Notification[] = [
  {
    id: "not-001",
    title: "Security pulse",
    message: "Login detected from your trusted Chicago browser.",
    kind: "security",
    createdAt: "2026-03-14T06:55:00.000Z",
  },
  {
    id: "not-002",
    title: "Transaction posted",
    message: "Fresh Market charge for $84.25 posted successfully.",
    kind: "transaction",
    createdAt: "2026-03-14T08:42:00.000Z",
  },
];

const baseAdminEvents: AdminEvent[] = [
  {
    id: "adm-001",
    kind: "system",
    label: "Transfer traffic normal",
    detail: "Transfer completion rate is 100% in the last 24 hours.",
    createdAt: "2026-03-14T09:05:00.000Z",
    severity: "info",
  },
  {
    id: "adm-002",
    kind: "security",
    label: "High-value activity",
    detail: "A direct deposit above $1,500 was posted to a customer account.",
    createdAt: "2026-03-13T12:20:00.000Z",
    severity: "high",
  },
];

const baseStatements: StatementSummary[] = [
  {
    id: "stmt-001",
    accountId: "chk-001",
    periodLabel: "February 2026",
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
    openingBalanceCents: 511230,
    closingBalanceCents: 582340,
    format: "csv",
    status: "available",
    fileName: "primary-checking-february-2026.csv",
    generatedAt: "2026-03-01T08:15:00.000Z",
  },
  {
    id: "stmt-002",
    accountId: "sav-001",
    periodLabel: "February 2026",
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
    openingBalanceCents: 1209040,
    closingBalanceCents: 1289040,
    format: "csv",
    status: "available",
    fileName: "rainy-day-savings-february-2026.csv",
    generatedAt: "2026-03-01T08:15:00.000Z",
  },
];

const baseExternalAccounts: ExternalAccount[] = [
  {
    id: "ext-001",
    institutionName: "Lakeside Federal",
    accountName: "Family joint checking",
    accountType: "checking",
    status: "linked",
    routingMask: "•••••0210",
    accountMask: "•••• 7821",
    createdAt: "2026-03-05T10:00:00.000Z",
    lastSyncAt: "2026-03-14T09:10:00.000Z",
  },
];

const baseBillPayments: BillPayment[] = [
  {
    id: "bill-001",
    fromAccountId: "chk-001",
    payeeName: "City Power",
    payeeCategory: "Utilities",
    amountCents: 12990,
    status: "paid",
    deliverBy: "2026-03-12",
    memo: "Monthly electricity bill",
    processedAt: "2026-03-12T08:15:00.000Z",
    createdAt: "2026-03-11T09:00:00.000Z",
  },
  {
    id: "bill-002",
    fromAccountId: "chk-001",
    payeeName: "Metro Water",
    payeeCategory: "Utilities",
    amountCents: 8600,
    status: "scheduled",
    deliverBy: "2026-03-18",
    memo: "Quarterly water bill",
    processedAt: null,
    createdAt: "2026-03-14T08:00:00.000Z",
  },
];

function mergeBalances(accounts: Account[], transfers: Transfer[], billPayments: BillPayment[]) {
  return accounts.map((account) => {
    let balanceCents = account.balanceCents;

    for (const transfer of transfers) {
      if (transfer.status !== "completed") {
        continue;
      }

      if (transfer.fromAccountId === account.id) {
        balanceCents -= transfer.amountCents;
      }
      if (transfer.toAccountId === account.id) {
        balanceCents += transfer.amountCents;
      }
    }

    for (const billPayment of billPayments) {
      if (billPayment.status === "paid" && billPayment.fromAccountId === account.id) {
        balanceCents -= billPayment.amountCents;
      }
    }

    return { ...account, balanceCents };
  });
}

async function readCookieArray<T>(key: string): Promise<T[]> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(key)?.value;

  if (!rawValue) {
    return [];
  }

  return JSON.parse(rawValue) as T[];
}

export async function getDemoBankingSnapshot(_session: AppSession): Promise<BankingSnapshot> {
  const cookieTransfers = await readCookieArray<Transfer>(DEMO_TRANSFERS_COOKIE);
  const cookieNotifications = await readCookieArray<Notification>(DEMO_NOTIFICATIONS_COOKIE);
  const cookieAdminEvents = await readCookieArray<AdminEvent>(DEMO_ADMIN_EVENTS_COOKIE);
  const cookieBillPayments = await readCookieArray<BillPayment>(DEMO_BILL_PAYMENTS_COOKIE);

  const allTransfers = [...cookieTransfers, ...baseTransfers].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );

  const transferTransactions: Transaction[] = [];
  const billPaymentTransactions: Transaction[] = cookieBillPayments
    .filter((billPayment) => billPayment.status === "paid")
    .map((billPayment) => ({
      id: `${billPayment.id}-posted`,
      accountId: billPayment.fromAccountId,
      merchantName: billPayment.payeeName,
      description: billPayment.memo || `Bill payment to ${billPayment.payeeName}`,
      category: "Bill Pay",
      amountCents: billPayment.amountCents,
      direction: "debit",
      status: "posted",
      occurredAt: billPayment.processedAt ?? billPayment.createdAt,
    }));

  for (const transfer of cookieTransfers) {
    if (transfer.status === "completed" && transfer.toAccountId) {
      transferTransactions.push(
        {
          id: `${transfer.id}-debit`,
          accountId: transfer.fromAccountId,
          merchantName: "Internal Transfer",
          description: transfer.memo || "Transfer sent",
          category: "Transfer",
          amountCents: transfer.amountCents,
          direction: "debit",
          status: "posted",
          occurredAt: transfer.createdAt,
        },
        {
          id: `${transfer.id}-credit`,
          accountId: transfer.toAccountId,
          merchantName: "Internal Transfer",
          description: transfer.memo || "Transfer received",
          category: "Transfer",
          amountCents: transfer.amountCents,
          direction: "credit",
          status: "posted",
          occurredAt: transfer.createdAt,
        },
      );
    }

    if (transfer.status === "pending_review") {
      transferTransactions.push({
        id: `${transfer.id}-pending`,
        accountId: transfer.fromAccountId,
        merchantName: "External Transfer",
        description: transfer.memo || "Transfer pending review",
        category: "Transfer",
        amountCents: transfer.amountCents,
        direction: "debit",
        status: "pending",
        occurredAt: transfer.createdAt,
      });
    }
  }

  return {
    accounts: mergeBalances(baseAccounts, cookieTransfers, cookieBillPayments),
    transactions: [...billPaymentTransactions, ...transferTransactions, ...baseTransactions].sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt),
    ),
    transfers: allTransfers,
    externalAccounts: await getDemoExternalAccounts(),
    notifications: [...cookieNotifications, ...baseNotifications].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
    adminEvents: [...cookieAdminEvents, ...baseAdminEvents].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
  };
}

export async function recordDemoTransfer(transfer: Transfer) {
  const cookieStore = await cookies();
  const existingTransfers = await readCookieArray<Transfer>(DEMO_TRANSFERS_COOKIE);
  const existingNotifications = await readCookieArray<Notification>(DEMO_NOTIFICATIONS_COOKIE);
  const existingAdminEvents = await readCookieArray<AdminEvent>(DEMO_ADMIN_EVENTS_COOKIE);

  const nextNotifications: Notification[] = [
    {
      id: `not-${transfer.id}`,
      title: transfer.status === "scheduled" ? "Transfer scheduled" : "Transfer update",
      message:
        transfer.status === "scheduled"
          ? `Transfer scheduled for $${(transfer.amountCents / 100).toFixed(2)}.`
          : transfer.transferRail === "external"
            ? `External transfer submitted for $${(transfer.amountCents / 100).toFixed(2)}.`
            : `Internal transfer submitted for $${(transfer.amountCents / 100).toFixed(2)}.`,
      kind: "transaction",
      createdAt: transfer.createdAt,
    },
    ...existingNotifications,
  ];

  const nextAdminEvents: AdminEvent[] = [
    {
      id: `adm-${transfer.id}`,
      kind: "transfer",
      label: transfer.status === "scheduled" ? "Member transfer scheduled" : "Member transfer recorded",
      detail: `A ${transfer.status} ${transfer.transferRail} transfer was recorded for $${(transfer.amountCents / 100).toFixed(2)}.`,
      createdAt: transfer.createdAt,
      severity: transfer.amountCents >= 100000 ? "high" : "info",
    },
    ...existingAdminEvents,
  ];

  cookieStore.set(DEMO_TRANSFERS_COOKIE, JSON.stringify([transfer, ...existingTransfers]), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(DEMO_NOTIFICATIONS_COOKIE, JSON.stringify(nextNotifications), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(DEMO_ADMIN_EVENTS_COOKIE, JSON.stringify(nextAdminEvents), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function getDemoStatements() {
  return [...baseStatements].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
}

export async function getDemoExternalAccounts() {
  const cookieAccounts = await readCookieArray<ExternalAccount>(DEMO_EXTERNAL_ACCOUNTS_COOKIE);

  return [...cookieAccounts, ...baseExternalAccounts].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function getDemoBillPayments() {
  const cookieBillPayments = await readCookieArray<BillPayment>(DEMO_BILL_PAYMENTS_COOKIE);

  return [...cookieBillPayments, ...baseBillPayments].sort((left, right) =>
    right.deliverBy.localeCompare(left.deliverBy),
  );
}

export async function recordDemoExternalAccountLink(externalAccount: ExternalAccount) {
  const cookieStore = await cookies();
  const existingExternalAccounts = await readCookieArray<ExternalAccount>(DEMO_EXTERNAL_ACCOUNTS_COOKIE);
  const existingNotifications = await readCookieArray<Notification>(DEMO_NOTIFICATIONS_COOKIE);
  const existingAdminEvents = await readCookieArray<AdminEvent>(DEMO_ADMIN_EVENTS_COOKIE);

  const nextNotifications: Notification[] = [
    {
      id: `not-${externalAccount.id}`,
      title: "External account linked",
      message: `${externalAccount.institutionName} was linked for future transfers and payments.`,
      kind: "security",
      createdAt: externalAccount.createdAt,
    },
    ...existingNotifications,
  ];

  const nextAdminEvents: AdminEvent[] = [
    {
      id: `adm-${externalAccount.id}`,
      kind: "security",
      label: "External account linked",
      detail: `${externalAccount.institutionName} was connected with masked account ${externalAccount.accountMask}.`,
      createdAt: externalAccount.createdAt,
      severity: "info",
    },
    ...existingAdminEvents,
  ];

  cookieStore.set(
    DEMO_EXTERNAL_ACCOUNTS_COOKIE,
    JSON.stringify([externalAccount, ...existingExternalAccounts]),
    {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    },
  );

  cookieStore.set(DEMO_NOTIFICATIONS_COOKIE, JSON.stringify(nextNotifications), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(DEMO_ADMIN_EVENTS_COOKIE, JSON.stringify(nextAdminEvents), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function recordDemoBillPayment(billPayment: BillPayment) {
  const cookieStore = await cookies();
  const existingBillPayments = await readCookieArray<BillPayment>(DEMO_BILL_PAYMENTS_COOKIE);
  const existingNotifications = await readCookieArray<Notification>(DEMO_NOTIFICATIONS_COOKIE);
  const existingAdminEvents = await readCookieArray<AdminEvent>(DEMO_ADMIN_EVENTS_COOKIE);

  const nextNotifications: Notification[] = [
    {
      id: `not-${billPayment.id}`,
      title: billPayment.status === "paid" ? "Bill paid" : "Bill payment scheduled",
      message:
        billPayment.status === "paid"
          ? `${billPayment.payeeName} was paid for $${(billPayment.amountCents / 100).toFixed(2)}.`
          : `${billPayment.payeeName} is scheduled for ${billPayment.deliverBy}.`,
      kind: "transaction",
      createdAt: billPayment.createdAt,
    },
    ...existingNotifications,
  ];

  const nextAdminEvents: AdminEvent[] = [
    {
      id: `adm-${billPayment.id}`,
      kind: "payment",
      label: "Bill payment recorded",
      detail: `${billPayment.payeeName} was recorded at $${(billPayment.amountCents / 100).toFixed(2)} with status ${billPayment.status}.`,
      createdAt: billPayment.createdAt,
      severity: billPayment.amountCents >= 100000 ? "high" : "info",
    },
    ...existingAdminEvents,
  ];

  cookieStore.set(DEMO_BILL_PAYMENTS_COOKIE, JSON.stringify([billPayment, ...existingBillPayments]), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(DEMO_NOTIFICATIONS_COOKIE, JSON.stringify(nextNotifications), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });

  cookieStore.set(DEMO_ADMIN_EVENTS_COOKIE, JSON.stringify(nextAdminEvents), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}
