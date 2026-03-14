import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats cents into USD output", () => {
    expect(formatCurrency(582340)).toBe("$5,823.40");
  });
});

describe("formatDate", () => {
  it("formats ISO dates for dashboard display", () => {
    expect(formatDate("2026-03-14T08:40:00.000Z")).toBe("Mar 14, 2026");
  });
});
