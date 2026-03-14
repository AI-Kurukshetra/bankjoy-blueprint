"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  recordDemoBillPayment,
  recordDemoExternalAccountLink,
  recordDemoTransfer,
} from "@/lib/demo-bank-data";
import {
  EXTERNAL_ACCOUNT_TYPES,
  maskAccountNumber,
  maskRoutingNumber,
} from "@/lib/external-accounts";
import { getActiveSession } from "@/lib/session";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  billPaymentSchema,
  externalAccountLinkSchema,
  transferSchema,
} from "@/lib/validations/auth";

export async function linkExternalAccountAction(formData: FormData) {
  const parsed = externalAccountLinkSchema.safeParse({
    institutionName: formData.get("institutionName"),
    accountName: formData.get("accountName"),
    accountType: formData.get("accountType"),
    routingNumber: formData.get("routingNumber"),
    accountNumber: formData.get("accountNumber"),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard/accounts?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Unable to link external account.",
      )}`,
    );
  }

  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  if (session.mode === "demo" || !hasSupabaseEnv()) {
    await recordDemoExternalAccountLink({
      id: `ext-${crypto.randomUUID()}`,
      institutionName: parsed.data.institutionName,
      accountName: parsed.data.accountName,
      accountType: parsed.data.accountType,
      status: "linked",
      routingMask: maskRoutingNumber(parsed.data.routingNumber),
      accountMask: maskAccountNumber(parsed.data.accountNumber),
      createdAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/accounts");
    redirect("/dashboard/accounts?message=External account linked.");
  }

  const supabase = await createClient();
  const normalizedType = EXTERNAL_ACCOUNT_TYPES.includes(parsed.data.accountType)
    ? parsed.data.accountType
    : "checking";

  const { error } = await supabase.from("external_accounts").insert({
    user_id: session.userId,
    institution_name: parsed.data.institutionName,
    account_name: parsed.data.accountName,
    account_type: normalizedType,
    status: "linked",
    routing_number_masked: maskRoutingNumber(parsed.data.routingNumber),
    account_number_masked: maskAccountNumber(parsed.data.accountNumber),
    last_sync_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/dashboard/accounts?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/accounts");
  redirect("/dashboard/accounts?message=External account linked.");
}

export async function submitTransferAction(formData: FormData) {
  const parsed = transferSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    transferRail: formData.get("transferRail"),
    toAccountId: formData.get("toAccountId") || undefined,
    externalAccountId: formData.get("externalAccountId") || undefined,
    amount: formData.get("amount"),
    memo: formData.get("memo"),
    scheduledFor: formData.get("scheduledFor") || undefined,
  });

  if (!parsed.success) {
    redirect(`/dashboard/transfers?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Transfer failed.")}`);
  }

  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  const scheduledFor = parsed.data.scheduledFor?.trim() ? parsed.data.scheduledFor : null;
  const status =
    scheduledFor && scheduledFor > new Date().toISOString().slice(0, 10)
      ? "scheduled"
      : parsed.data.transferRail === "external"
        ? "pending_review"
        : "completed";

  if (session.mode === "demo" || !hasSupabaseEnv()) {
    await recordDemoTransfer({
      id: `trf-${crypto.randomUUID()}`,
      fromAccountId: parsed.data.fromAccountId,
      toAccountId: parsed.data.transferRail === "internal" ? parsed.data.toAccountId ?? null : null,
      externalAccountId: parsed.data.transferRail === "external" ? parsed.data.externalAccountId ?? null : null,
      transferRail: parsed.data.transferRail,
      amountCents: Math.round(parsed.data.amount * 100),
      memo: parsed.data.memo ?? "",
      status,
      scheduledFor,
      processedAt: status === "completed" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/transfers");
    redirect(`/dashboard/transfers?success=${status}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_transfer", {
    p_from_account_id: parsed.data.fromAccountId,
    p_to_account_id: parsed.data.transferRail === "internal" ? parsed.data.toAccountId ?? null : null,
    p_external_account_id: parsed.data.transferRail === "external" ? parsed.data.externalAccountId ?? null : null,
    p_transfer_rail: parsed.data.transferRail,
    p_amount_cents: Math.round(parsed.data.amount * 100),
    p_memo: parsed.data.memo ?? null,
    p_scheduled_for: scheduledFor,
  });

  if (error) {
    redirect(`/dashboard/transfers?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/transfers");
  redirect(`/dashboard/transfers?success=${status}`);
}

export async function submitBillPaymentAction(formData: FormData) {
  const parsed = billPaymentSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    payeeName: formData.get("payeeName"),
    payeeCategory: formData.get("payeeCategory"),
    amount: formData.get("amount"),
    deliverBy: formData.get("deliverBy"),
    memo: formData.get("memo"),
  });

  if (!parsed.success) {
    redirect(`/dashboard/payments?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Bill payment failed.")}`);
  }

  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  const status = parsed.data.deliverBy > new Date().toISOString().slice(0, 10) ? "scheduled" : "paid";

  if (session.mode === "demo" || !hasSupabaseEnv()) {
    await recordDemoBillPayment({
      id: `bill-${crypto.randomUUID()}`,
      fromAccountId: parsed.data.fromAccountId,
      payeeName: parsed.data.payeeName,
      payeeCategory: parsed.data.payeeCategory,
      amountCents: Math.round(parsed.data.amount * 100),
      status,
      deliverBy: parsed.data.deliverBy,
      memo: parsed.data.memo ?? "",
      processedAt: status === "paid" ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/payments");
    redirect(`/dashboard/payments?message=${encodeURIComponent(status === "paid" ? "Bill payment completed." : "Bill payment scheduled.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_bill_payment", {
    p_from_account_id: parsed.data.fromAccountId,
    p_payee_name: parsed.data.payeeName,
    p_payee_category: parsed.data.payeeCategory,
    p_amount_cents: Math.round(parsed.data.amount * 100),
    p_deliver_by: parsed.data.deliverBy,
    p_memo: parsed.data.memo ?? null,
  });

  if (error) {
    redirect(`/dashboard/payments?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/payments");
  redirect(`/dashboard/payments?message=${encodeURIComponent(status === "paid" ? "Bill payment completed." : "Bill payment scheduled.")}`);
}
