import { describe, expect, it } from "vitest";

import {
  formatExternalAccountType,
  maskAccountNumber,
  maskRoutingNumber,
} from "@/lib/external-accounts";

describe("external account helpers", () => {
  it("masks routing and account numbers", () => {
    expect(maskRoutingNumber("071000013")).toBe("•••••0013");
    expect(maskAccountNumber("9876543210")).toBe("•••• 3210");
  });

  it("formats external account types for display", () => {
    expect(formatExternalAccountType("investment")).toBe("Investment");
  });
});
