import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EmailTemplatePreview } from "@/components/dashboard/email-template-preview";
import { getCommonEmailTemplates, hostedResetTemplateHtml } from "@/lib/email/templates";
import { getActiveSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Email Templates | Bankjoy",
};

export default async function AdminEmailsPage() {
  const session = await getActiveSession();

  if (!session) {
    return null;
  }

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  const templates = getCommonEmailTemplates();

  return <EmailTemplatePreview hostedResetTemplateHtml={hostedResetTemplateHtml} templates={templates} />;
}
