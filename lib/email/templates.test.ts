import { describe, expect, it } from "vitest";

import { getCommonEmailTemplates, renderBankEmail } from "@/lib/email/templates";

describe("renderBankEmail", () => {
  it("escapes unsafe content and renders the CTA", () => {
    const html = renderBankEmail({
      preheader: "Preview",
      eyebrow: "Security",
      title: "Reset <Password>",
      intro: "Intro",
      recipientName: "<Avery>",
      summary: "Use the secure flow.",
      ctaLabel: "Continue",
      ctaHref: "https://bankjoy.test/reset",
    });

    expect(html).toContain("Reset &lt;Password&gt;");
    expect(html).toContain("Hello &lt;Avery&gt;,");
    expect(html).toContain("Continue");
    expect(html).not.toContain("Hello <Avery>,");
  });

  it("returns the common banking templates", () => {
    const templates = getCommonEmailTemplates();

    expect(templates).toHaveLength(5);
    expect(templates.map((template) => template.id)).toEqual([
      "welcome",
      "password-reset",
      "transfer-posted",
      "security-alert",
      "statement-ready",
    ]);
  });
});
