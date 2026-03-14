import { describe, expect, it } from "vitest";

import { passwordResetRequestSchema, passwordUpdateSchema } from "@/lib/validations/auth";

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
});
