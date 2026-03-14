import { describe, expect, it } from "vitest";

import { buildStatementCsv } from "@/lib/statements";

describe("buildStatementCsv", () => {
  it("includes statement metadata and account transactions inside the selected period", () => {
    const csv = buildStatementCsv({
      account: {
        id: "acct-1",
        name: "Primary Checking",
        type: "Checking",
        mask: "•••• 1024",
        balanceCents: 582340,
        currency: "USD",
      },
      statement: {
        id: "stmt-1",
        accountId: "acct-1",
        periodLabel: "February 2026",
        periodStart: "2026-02-01",
        periodEnd: "2026-02-28",
        openingBalanceCents: 511230,
        closingBalanceCents: 582340,
        format: "csv",
        status: "available",
        fileName: "primary-checking-february-2026.csv",
        generatedAt: "2026-03-01T08:00:00.000Z",
      },
      transactions: [
        {
          id: "txn-1",
          accountId: "acct-1",
          merchantName: "Payroll",
          description: "Monthly direct deposit",
          category: "Income",
          amountCents: 184500,
          direction: "credit",
          status: "posted",
          occurredAt: "2026-02-20T08:00:00.000Z",
        },
        {
          id: "txn-2",
          accountId: "acct-1",
          merchantName: "Fresh Market",
          description: "Grocery refill",
          category: "Groceries",
          amountCents: 8425,
          direction: "debit",
          status: "posted",
          occurredAt: "2026-03-03T08:00:00.000Z",
        },
      ],
    });

    expect(csv).toContain("\"Statement\",\"February 2026\"");
    expect(csv).toContain("\"Monthly direct deposit\"");
    expect(csv).not.toContain("\"Grocery refill\"");
  });
});
