import { NextResponse, type NextRequest } from "next/server";

import { getAccountManagementSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";
import { buildStatementCsv } from "@/lib/statements";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ statementId: string }> },
) {
  const session = await getActiveSession();

  if (!session) {
    return new NextResponse("Authentication required", { status: 401 });
  }

  const { statementId } = await params;
  const accountSnapshot = await getAccountManagementSnapshot(session);

  const statement = accountSnapshot.statements.find((entry) => entry.id === statementId);

  if (!statement) {
    return new NextResponse("Statement not found", { status: 404 });
  }

  const account = accountSnapshot.accounts.find((entry) => entry.id === statement.accountId);

  if (!account) {
    return new NextResponse("Account not found", { status: 404 });
  }

  const csv = buildStatementCsv({
    account,
    statement,
    transactions: accountSnapshot.transactions,
  });

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${statement.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
