import type { Account, Transaction } from "@/lib/demo-bank-data";

export type StatementRecord = {
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

export function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toStatementWindowEnd(value: string) {
  return new Date(`${value}T23:59:59.999Z`);
}

export function buildStatementCsv(input: {
  account: Account;
  statement: StatementRecord;
  transactions: Transaction[];
}) {
  const periodStart = new Date(`${input.statement.periodStart}T00:00:00.000Z`);
  const periodEnd = toStatementWindowEnd(input.statement.periodEnd);
  const rows = input.transactions
    .filter((transaction) => {
      const occurredAt = new Date(transaction.occurredAt);
      return (
        transaction.accountId === input.account.id &&
        occurredAt >= periodStart &&
        occurredAt <= periodEnd
      );
    })
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));

  const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

  const headerRows = [
    ["Statement", input.statement.periodLabel],
    ["Account", input.account.name],
    ["Account Type", input.account.type],
    ["Account Number", input.account.mask],
    ["Period Start", input.statement.periodStart],
    ["Period End", input.statement.periodEnd],
    ["Opening Balance", (input.statement.openingBalanceCents / 100).toFixed(2)],
    ["Closing Balance", (input.statement.closingBalanceCents / 100).toFixed(2)],
    [],
    ["Date", "Description", "Merchant", "Category", "Direction", "Status", "Amount"],
  ];

  const transactionRows = rows.map((transaction) => [
    transaction.occurredAt,
    transaction.description,
    transaction.merchantName,
    transaction.category,
    transaction.direction,
    transaction.status,
    (transaction.amountCents / 100).toFixed(2),
  ]);

  return [...headerRows, ...transactionRows]
    .map((row) => row.map((value) => escapeCsv(value ?? "")).join(","))
    .join("\n");
}
