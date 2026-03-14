import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { AppSession } from "@/lib/session";
import {
  getDemoBankingSnapshot,
  getDemoStatements,
  type Account,
  type AdminEvent,
  type BankingSnapshot,
  type Notification,
  type StatementSummary,
  type Transaction,
} from "@/lib/demo-bank-data";
import type { StatementRecord } from "@/lib/statements";

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
  statements: StatementRecord[];
  transactions: Transaction[];
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

export async function getBankingSnapshot(session: AppSession): Promise<BankingSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    return getDemoBankingSnapshot(session);
  }

  const supabase = await createClient();

  const [accountsResult, transactionsResult, transfersResult, notificationsResult] = await Promise.all([
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
      .select("id, from_account_id, to_account_id, amount_cents, memo, status, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("notifications")
      .select("id, title, message, kind, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(20),
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
      amountCents: transfer.amount_cents,
      memo: transfer.memo ?? "",
      status: transfer.status as "completed",
      createdAt: transfer.created_at,
    })),
    notifications: (notificationsResult.data ?? []).map(mapNotification),
    adminEvents: [],
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

  return {
    profiles: (profilesResult.data ?? []).map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name ?? "Member",
      role: profile.role as "member" | "admin",
      createdAt: profile.created_at,
    })),
    transactions: (transactionsResult.data ?? []).map(mapTransaction),
    adminEvents: (alertsResult.data ?? []).map((alert) => ({
      id: alert.id,
      label: alert.kind.replace(/_/g, " "),
      detail: alert.message,
      createdAt: alert.created_at,
      severity: alert.severity === "high" ? "high" : "info",
    })),
  };
}

export async function getAccountManagementSnapshot(session: AppSession): Promise<AccountManagementSnapshot> {
  if (session.mode === "demo" || !hasSupabaseEnv()) {
    const snapshot = await getDemoBankingSnapshot(session);
    const statements = (await getDemoStatements()) as StatementSummary[];

    return {
      accounts: snapshot.accounts.map((account) =>
        summarizeAccount(account, "2026-02-28T08:00:00.000Z", snapshot.transactions),
      ),
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

  const [accountsResult, transactionsResult, statementsResult] = await Promise.all([
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
    statements: (statementsResult.data ?? []).map(mapStatement),
    transactions,
  };
}
