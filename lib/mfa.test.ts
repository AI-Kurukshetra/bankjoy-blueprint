import { describe, expect, it } from "vitest";

import { getAuthenticatedRedirectPath, getMfaState, normalizeMfaQrCode } from "@/lib/mfa";

describe("getMfaState", () => {
  it("marks MFA as required when the session can step up to aal2", () => {
    expect(getMfaState("aal1", "aal2")).toEqual({
      currentLevel: "aal1",
      nextLevel: "aal2",
      isEnabled: true,
      isRequired: true,
    });
  });

  it("does not require MFA when no factor is enrolled", () => {
    expect(getMfaState("aal1", "aal1")).toEqual({
      currentLevel: "aal1",
      nextLevel: "aal1",
      isEnabled: false,
      isRequired: false,
    });
  });
});

describe("getAuthenticatedRedirectPath", () => {
  it("routes MFA-required sessions to the verification screen", () => {
    expect(getAuthenticatedRedirectPath({ isRequired: true })).toBe("/mfa");
  });
});

describe("normalizeMfaQrCode", () => {
  it("encodes raw SVG payloads into a safe data URL", () => {
    const result = normalizeMfaQrCode(`
      <?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8" /></svg>
    `);

    expect(result).toContain("data:image/svg+xml;charset=utf-8,");
    expect(result).toContain("%3Csvg");
    expect(result).not.toContain("\n");
  });

  it("encodes inline SVG payloads inside existing data URLs", () => {
    const result = normalizeMfaQrCode(`data:image/svg+xml;utf-8,<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg"></svg>
`);

    expect(result).toBe(
      "data:image/svg+xml;utf-8,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3C%2Fsvg%3E",
    );
  });
});
