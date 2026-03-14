import type { Metadata } from "next";

import { submitBillPaymentAction } from "@/app/(dashboard)/actions";
import { BillPaymentCenter } from "@/components/dashboard/bill-payment-center";
import { getBillPaymentsSnapshot } from "@/lib/bank-data";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Bill Payments | Bankjoy",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  const snapshot = await getBillPaymentsSnapshot(session);
  const { error, message } = await searchParams;

  return (
    <BillPaymentCenter
      accounts={snapshot.accounts}
      action={submitBillPaymentAction}
      billPayments={snapshot.billPayments}
      error={error}
      message={message}
    />
  );
}
