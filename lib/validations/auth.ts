import { z } from "zod";

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
  toAccountId: z.string().min(1, "Select a destination account."),
  amount: z.coerce.number().positive("Transfer amount must be positive."),
  memo: z.string().trim().max(120, "Memo must be 120 characters or fewer.").optional(),
}).refine((value) => value.fromAccountId !== value.toAccountId, {
  message: "Choose two different accounts.",
  path: ["toAccountId"],
});

export type AuthInput = z.infer<typeof authSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
