import { z } from "zod";

import { EXTERNAL_ACCOUNT_TYPES } from "@/lib/external-accounts";

export const authSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").optional(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const passwordResetRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your new password."),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords must match.",
  path: ["confirmPassword"],
});

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Select a source account."),
  transferRail: z.enum(["internal", "external"], {
    error: "Select a transfer type.",
  }),
  toAccountId: z.string().optional(),
  externalAccountId: z.string().optional(),
  amount: z.coerce.number().positive("Transfer amount must be positive."),
  memo: z.string().trim().max(120, "Memo must be 120 characters or fewer.").optional(),
  scheduledFor: z.string().optional(),
})
  .refine((value) => (value.transferRail === "internal" ? Boolean(value.toAccountId) : Boolean(value.externalAccountId)), {
    message: "Select a destination account.",
    path: ["toAccountId"],
  })
  .refine((value) => (value.transferRail === "internal" ? value.fromAccountId !== value.toAccountId : true), {
    message: "Choose two different accounts.",
    path: ["toAccountId"],
  });

export const externalAccountLinkSchema = z.object({
  institutionName: z.string().trim().min(2, "Enter a financial institution."),
  accountName: z.string().trim().min(2, "Enter an account nickname."),
  accountType: z.enum(EXTERNAL_ACCOUNT_TYPES, {
    error: "Select an external account type.",
  }),
  routingNumber: z.string().regex(/^\d{9}$/, "Routing number must be 9 digits."),
  accountNumber: z.string().regex(/^\d{4,17}$/, "Account number must be 4 to 17 digits."),
});

export const billPaymentSchema = z.object({
  fromAccountId: z.string().min(1, "Select a payment account."),
  payeeName: z.string().trim().min(2, "Enter a payee."),
  payeeCategory: z.string().trim().min(2, "Enter a payment category."),
  amount: z.coerce.number().positive("Bill payment amount must be positive."),
  deliverBy: z.string().min(1, "Select a payment date."),
  memo: z.string().trim().max(120, "Memo must be 120 characters or fewer.").optional(),
});

export type AuthInput = z.infer<typeof authSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type ExternalAccountLinkInput = z.infer<typeof externalAccountLinkSchema>;
export type BillPaymentInput = z.infer<typeof billPaymentSchema>;
