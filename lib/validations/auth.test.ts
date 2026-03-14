import { describe, expect, it } from "vitest";

import {
  billPaymentSchema,
  externalAccountLinkSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
} from "@/lib/validations/auth";

describe("password reset validation", () => {
  it("accepts a valid reset email", () => {
    const result = passwordResetRequestSchema.safeParse({
      email: "member@bankjoy.dev",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = passwordUpdateSchema.safeParse({
      password: "Password@123",
      confirmPassword: "Password@456",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid external account link request", () => {
    const result = externalAccountLinkSchema.safeParse({
      institutionName: "North Harbor Bank",
      accountName: "Travel checking",
      accountType: "checking",
      routingNumber: "021000021",
      accountNumber: "9876543210",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a valid bill payment request", () => {
    const result = billPaymentSchema.safeParse({
      fromAccountId: "acct-123",
      payeeName: "City Power",
      payeeCategory: "Utilities",
      amount: "129.90",
      deliverBy: "2026-03-20",
      memo: "March utilities",
    });

    expect(result.success).toBe(true);
  });
});
