import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { AppSession } from "@/lib/session";
import {
  getDemoBillPayments,
  getDemoExternalAccounts,
  getDemoBankingSnapshot,
  getDemoStatements,
  type Account,
  type AdminEvent,
  type BankingSnapshot,
  type BillPayment,
  type ExternalAccount,
  type Notification,
  type StatementSummary,
  type Transaction,
} from "@/lib/demo-bank-data";
import type { ExternalAccountRecord } from "@/lib/external-accounts";
import type { StatementRecord } from "@/lib/statements";
import type { BillPaymentRecord } from "@/components/dashboard/bill-payment-center";

export type MemberProfile = {
  id: string;
  email: string;
  fullName: string;
  role: "member" | "admin";
  createdAt: string;
};

export type AdminSnapshot = {
  profiles: MemberProfile[];
  transactions: Transaction[];
  adminEvents: AdminEvent[];
  summary: {
    highSeverityCount: number;
    securityEventCount: number;
    transferEventCount: number;
    paymentEventCount: number;
    systemEventCount: number;
  };
};

export type ManagedAccount = Account & {
  createdAt: string;
  monthlyCreditsCents: number;
  monthlyDebitsCents: number;
  transactionCount: number;
  latestActivityAt: string | null;
};

export type AccountManagementSnapshot = {
  accounts: ManagedAccount[];
  externalAccounts: ExternalAccountRecord[];
  statements: StatementRecord[];
  transactions: Transaction[];
};

export type BillPaymentsSnapshot = {
  accounts: Account[];
  billPayments: BillPaymentRecord[];
};

function mapTransaction(transaction: {
  id: string;
  account_id: string;
  merchant_name: string | null;
  description: string;
  category: string;
  amount_cents: number;
  direction: "credit" | "debit";
  status: "posted" | "pending";
  occurred_at: string;
}): Transaction {
  return {
    id: transaction.id,
    accountId: transaction.account_id,
    merchantName: transaction.merchant_name ?? "Bankjoy",
    description: transaction.description,
    category: transaction.category,
    amountCents: transaction.amount_cents,
    direction: transaction.direction,
    status: transaction.status,
    occurredAt: transaction.occurred_at,
  };
}

function mapNotification(notification: {
  id: string;
  title: string;
  message: string;
  kind: "transaction" | "security";
  created_at: string;
}): Notification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    kind: notification.kind,
    createdAt: notification.created_at,
  };
}

function mapStatement(statement: {
  id: string;
  account_id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  opening_balance_cents: number;
  closing_balance_cents: number;
  format: "csv";
  status: "available";
  file_name: string;
  generated_at: string;
}): StatementRecord {
  return {
    id: statement.id,
    accountId: statement.account_id,
    periodLabel: statement.period_label,
    periodStart: statement.period_start,
    periodEnd: statement.period_end,
    openingBalanceCents: statement.opening_balance_cents,
    closingBalanceCents: statement.closing_balance_cents,
    format: statement.format,
    status: statement.status,
    fileName: statement.file_name,
    generatedAt: statement.generated_at,
  };
}

function summarizeAccount(account: Account, createdAt: string, transactions: Transaction[]): ManagedAccount {
  const accountTransactions = transactions.filter((transaction) => transaction.accountId === account.id);

  return {
    ...account,
    createdAt,
    monthlyCreditsCents: accountTransactions
      .filter((transaction) => transaction.direction === "credit" && transaction.status === "posted")
      .reduce((sum, transaction) => sum + transaction.amountCents, 0),
    monthlyDebitsCents: accountTransactions
      .filter((transaction) => transaction.direction === "debit" && transaction.status === "posted")
      .reduce((sum, transaction) => sum + transaction.amountCents, 0),
    transactionCount: accountTransactions.length,
    latestActivityAt: accountTransactions[0]?.occurredAt ?? null,
  };
}

function mapExternalAccount(account: {
  id: string;
  institution_name: string;
  account_name: string;
  account_type: "checking" | "savings" | "credit" | "loan" | "investment";
  status: "linked" | "pending_review";
  routing_number_masked: string;
  account_number_masked: string;
  created_at: string;
  last_sync_at: string;
}): ExternalAccountRecord {
  return {
    id: account.id,
    institutionName: account.institution_name,
    accountName: account.account_name,
    accountType: account.account_type,
    status: account.status,
    routingMask: account.routing_number_masked,
    accountMask: account.account_number_masked,
    createdAt: account.created_at,
    lastSyncAt: account.last_sync_at,
  };
}

function classifyAdminEventKind(kind: string): AdminEvent["kind"] {
  if (kind.includes("security") || kind.includes("external_account") || kind.includes("mfa")) {
    return "security";
  }

  if (kind.includes("payment") || kind.includes("bill")) {
    return "payment";
  }

  if (kind.includes("transfer")) {
    return "transfer";
  }

  if (kind.includes("profile") || kind.includes("user")) {
    return "profile";
  }

  return "system";
}

function summarizeAdminEvents(adminEvents: AdminEvent[]) {
  return {
    highSeverityCount: adminEvents.filter((event) => event.severity === "high").length,
    securityEventCount: adminEvents.filter((event) => event.kind === "security").length,
    transferEventCount: adminEvents.filter((event) => event.kind === "transfer").length,
    paymentEventCount: adminEvents.filter((event) => event.kind === "payment").length,
    systemEventCount: adminEvents.filter((event) => event.kind === "system").length,
  };
}

function mapBillPayment(payment: {
  id: string;
  from_account_id: string;
  payee_name: string;
  payee_category: string;
  amount_cents: number;
  status: "scheduled" | "processing" | "paid";
  deliver_by: string;
  memo: string | null;
  processed_at: string | null;
  created_at: string;
}): BillPaymentRecord {
  return {
    id: payment.id,
    fromAccountId: payment.from_account_id,
    payeeName: payment.payee_name,
    payeeCategory: payment.payee_category,
    amountCents: payment.amount_cents,
    status: payment.status,
    deliverBy: payment.deliver_by,
    memo: payment.memo ?? "",
    processedAt: payment.processed_at,
    createdAt: payment.created_at,
  };
}

export async function getBankingSnapshot(session: AppSession): Promise<BankingSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    return getDemoBankingSnapshot(session);
  }

  const supabase = await createClient();

  const [accountsResult, transactionsResult, transfersResult, notificationsResult, externalAccountsResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, type, account_number_masked, balance_cents, currency")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("id, account_id, merchant_name, description, category, amount_cents, direction, status, occurred_at")
      .eq("user_id", session.userId)
      .order("occurred_at", { ascending: false })
      .limit(50),
    supabase
      .from("transfers")
      .select(
        "id, from_account_id, to_account_id, external_account_id, transfer_rail, amount_cents, memo, status, scheduled_for, processed_at, created_at",
      )
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications")
      .select("id, title, message, kind, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("external_accounts")
      .select(
        "id, institution_name, account_name, account_type, status, routing_number_masked, account_number_masked, created_at, last_sync_at",
      )
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false }),
  ]);

  if (accountsResult.error) {
    throw accountsResult.error;
  }
  if (transactionsResult.error) {
    throw transactionsResult.error;
  }
  if (transfersResult.error) {
    throw transfersResult.error;
  }
  if (notificationsResult.error) {
    throw notificationsResult.error;
  }
  if (externalAccountsResult.error) {
    throw externalAccountsResult.error;
  }

  const accounts: Account[] = (accountsResult.data ?? []).map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    mask: account.account_number_masked,
    balanceCents: account.balance_cents,
    currency: account.currency,
  }));

  return {
    accounts,
    transactions: (transactionsResult.data ?? []).map(mapTransaction),
    transfers: (transfersResult.data ?? []).map((transfer) => ({
      id: transfer.id,
      fromAccountId: transfer.from_account_id,
      toAccountId: transfer.to_account_id,
      externalAccountId: transfer.external_account_id,
      transferRail: (transfer.transfer_rail as "internal" | "external") ?? "internal",
      amountCents: transfer.amount_cents,
      memo: transfer.memo ?? "",
      status: transfer.status as "completed" | "pending_review" | "scheduled",
      scheduledFor: transfer.scheduled_for,
      processedAt: transfer.processed_at,
      createdAt: transfer.created_at,
    })),
    externalAccounts: (externalAccountsResult.data ?? []).map(mapExternalAccount),
    notifications: (notificationsResult.data ?? []).map(mapNotification),
    adminEvents: [],
  };
}

export async function getBillPaymentsSnapshot(session: AppSession): Promise<BillPaymentsSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    const snapshot = await getDemoBankingSnapshot(session);
    const billPayments = (await getDemoBillPayments()) as BillPayment[];

    return {
      accounts: snapshot.accounts,
      billPayments: billPayments.map((payment) => ({
        id: payment.id,
        fromAccountId: payment.fromAccountId,
        payeeName: payment.payeeName,
        payeeCategory: payment.payeeCategory,
        amountCents: payment.amountCents,
        status: payment.status,
        deliverBy: payment.deliverBy,
        memo: payment.memo,
        processedAt: payment.processedAt,
        createdAt: payment.createdAt,
      })),
    };
  }

  const supabase = await createClient();

  const [accountsResult, billPaymentsResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, type, account_number_masked, balance_cents, currency")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("bill_payments")
      .select("id, from_account_id, payee_name, payee_category, amount_cents, status, deliver_by, memo, processed_at, created_at")
      .eq("user_id", session.userId)
      .order("deliver_by", { ascending: false }),
  ]);

  if (accountsResult.error) {
    throw accountsResult.error;
  }
  if (billPaymentsResult.error) {
    throw billPaymentsResult.error;
  }

  return {
    accounts: (accountsResult.data ?? []).map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      mask: account.account_number_masked,
      balanceCents: account.balance_cents,
      currency: account.currency,
    })),
    billPayments: (billPaymentsResult.data ?? []).map(mapBillPayment),
  };
}

export async function getAdminSnapshot(session: AppSession): Promise<AdminSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    const snapshot = await getDemoBankingSnapshot(session);
    return {
      profiles: [
        {
          id: session.userId,
          email: session.email,
          fullName: session.fullName,
          role: session.role,
          createdAt: new Date().toISOString(),
        },
      ],
      transactions: snapshot.transactions,
      adminEvents: snapshot.adminEvents,
      summary: summarizeAdminEvents(snapshot.adminEvents),
    };
  }

  const supabase = await createClient();

  const [profilesResult, transactionsResult, alertsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("transactions")
      .select("id, account_id, merchant_name, description, category, amount_cents, direction, status, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(25),
    supabase
      .from("alerts")
      .select("id, kind, severity, message, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }
  if (transactionsResult.error) {
    throw transactionsResult.error;
  }
  if (alertsResult.error) {
    throw alertsResult.error;
  }

  const adminEvents = (alertsResult.data ?? []).map((alert): AdminEvent => {
    const severity: AdminEvent["severity"] = alert.severity === "high" ? "high" : "info";

    return {
      id: alert.id,
      kind: classifyAdminEventKind(alert.kind),
      label: alert.kind.replace(/_/g, " "),
      detail: alert.message,
      createdAt: alert.created_at,
      severity,
    };
  });

  return {
    profiles: (profilesResult.data ?? []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name ?? "Member",
      role: profile.role as "member" | "admin",
      createdAt: profile.created_at,
    })),
    transactions: (transactionsResult.data ?? []).map(mapTransaction),
    adminEvents,
    summary: summarizeAdminEvents(adminEvents),
  };
}

export async function getAccountManagementSnapshot(session: AppSession): Promise<AccountManagementSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    const snapshot = await getDemoBankingSnapshot(session);
    const statements = (await getDemoStatements()) as StatementSummary[];
    const externalAccounts = (await getDemoExternalAccounts()) as ExternalAccount[];

    return {
      accounts: snapshot.accounts.map((account) =>
        summarizeAccount(account, "2026-02-28T08:00:00.000Z", snapshot.transactions),
      ),
      externalAccounts: externalAccounts.map((account) => ({
        id: account.id,
        institutionName: account.institutionName,
        accountName: account.accountName,
        accountType: account.accountType,
        status: account.status,
        routingMask: account.routingMask,
        accountMask: account.accountMask,
        createdAt: account.createdAt,
        lastSyncAt: account.lastSyncAt,
      })),
      statements: statements.map((statement) => ({
        id: statement.id,
        accountId: statement.accountId,
        periodLabel: statement.periodLabel,
        periodStart: statement.periodStart,
        periodEnd: statement.periodEnd,
        openingBalanceCents: statement.openingBalanceCents,
        closingBalanceCents: statement.closingBalanceCents,
        format: statement.format,
        status: statement.status,
        fileName: statement.fileName,
        generatedAt: statement.generatedAt,
      })),
      transactions: snapshot.transactions,
    };
  }

  const supabase = await createClient();

  const [accountsResult, transactionsResult, statementsResult, externalAccountsResult] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, name, type, account_number_masked, balance_cents, currency, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("id, account_id, merchant_name, description, category, amount_cents, direction, status, occurred_at")
      .eq("user_id", session.userId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("statements")
      .select(
        "id, account_id, period_label, period_start, period_end, opening_balance_cents, closing_balance_cents, format, status, file_name, generated_at",
      )
      .eq("user_id", session.userId)
      .order("generated_at", { ascending: false }),
    supabase
      .from("external_accounts")
      .select(
        "id, institution_name, account_name, account_type, status, routing_number_masked, account_number_masked, created_at, last_sync_at",
      )
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false }),
  ]);

  if (accountsResult.error) {
    throw accountsResult.error;
  }
  if (transactionsResult.error) {
    throw transactionsResult.error;
  }
  if (statementsResult.error) {
    throw statementsResult.error;
  }
  if (externalAccountsResult.error) {
    throw externalAccountsResult.error;
  }

  const transactions = (transactionsResult.data ?? []).map(mapTransaction);
  const accounts = (accountsResult.data ?? []).map((account) =>
    summarizeAccount(
      {
        id: account.id,
        name: account.name,
        type: account.type,
        mask: account.account_number_masked,
        balanceCents: account.balance_cents,
        currency: account.currency,
      },
      account.created_at,
      transactions,
    ),
  );

  return {
    accounts,
    externalAccounts: (externalAccountsResult.data ?? []).map(mapExternalAccount),
    statements: (statementsResult.data ?? []).map(mapStatement),
    transactions,
  };
}
