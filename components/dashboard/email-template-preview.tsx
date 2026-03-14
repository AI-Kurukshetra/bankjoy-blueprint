import { Card } from "@/components/ui/card";
import type { CommonEmailTemplate } from "@/lib/email/templates";

type EmailTemplatePreviewProps = {
  hostedResetTemplateHtml: string;
  templates: CommonEmailTemplate[];
};

export function EmailTemplatePreview({ hostedResetTemplateHtml, templates }: EmailTemplatePreviewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/70 bg-[linear-gradient(135deg,#112134_0%,#1f3550_65%,#00a6a6_180%)] p-8 text-white shadow-panel">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-white/55">Communications</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">Email templates</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
              A shared email system for account onboarding, security notices, transfers, and document delivery using the same Bankjoy visual language.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Templates</p>
              <p className="mt-2 font-semibold text-white">{templates.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Theme</p>
              <p className="mt-2 font-semibold text-white">Bankjoy</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Format</p>
              <p className="mt-2 font-semibold text-white">HTML email</p>
            </div>
          </div>
        </div>
      </section>

      <Card>
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Authentication email</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Password reset template</h2>
            </div>
            <div className="rounded-[24px] border border-line/70 bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Use this in email settings</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Paste this HTML into your authentication email settings for password resets so the hosted recovery email matches Bankjoy and uses the secure confirmation route.
              </p>
            </div>
            <div className="rounded-[24px] border border-line/70 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Required route</p>
              <p className="mt-2 font-mono text-sm text-ink">/auth/confirm</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[28px] border border-line/80 bg-white">
              <div className="border-b border-line/70 bg-mist px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Rendered email</p>
                <p className="mt-1 text-sm text-muted">This is how the reset message appears inside the inbox content area.</p>
              </div>
              <iframe
                className="h-[760px] w-full bg-white"
                srcDoc={hostedResetTemplateHtml}
                title="Password reset email preview"
              />
            </div>
            <div className="overflow-hidden rounded-[28px] border border-line/80 bg-[#0f1724]">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Template source</p>
                <p className="mt-1 text-sm text-slate-300">Copy this HTML into the hosted password reset email configuration.</p>
              </div>
              <pre className="max-h-[560px] overflow-auto p-6 text-sm leading-7 text-slate-100">
                <code>{hostedResetTemplateHtml}</code>
              </pre>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-6">
        {templates.map((template) => (
          <Card key={template.id}>
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Template</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">{template.subject}</h2>
                </div>
                <div className="rounded-[24px] border border-line/70 bg-mist p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Preview text</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{template.previewText}</p>
                </div>
                <div className="rounded-[24px] border border-line/70 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Template key</p>
                  <p className="mt-2 font-mono text-sm text-ink">{template.id}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-line/80 bg-white">
                <iframe
                  className="h-[760px] w-full bg-white"
                  srcDoc={template.html}
                  title={`${template.subject} preview`}
                />
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
