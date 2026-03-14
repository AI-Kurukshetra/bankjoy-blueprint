export const EXTERNAL_ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit",
  "loan",
  "investment",
] as const;

export const EXTERNAL_ACCOUNT_STATUSES = ["linked", "pending_review"] as const;

export type ExternalAccountType = (typeof EXTERNAL_ACCOUNT_TYPES)[number];
export type ExternalAccountStatus = (typeof EXTERNAL_ACCOUNT_STATUSES)[number];

export type ExternalAccountRecord = {
  id: string;
  institutionName: string;
  accountName: string;
  accountType: ExternalAccountType;
  status: ExternalAccountStatus;
  routingMask: string;
  accountMask: string;
  createdAt: string;
  lastSyncAt: string;
};

export function maskRoutingNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  return `•••••${digits.slice(-4)}`;
}

export function maskAccountNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  return `•••• ${digits.slice(-4)}`;
}

export function formatExternalAccountType(value: ExternalAccountType) {
  switch (value) {
    case "checking":
      return "Checking";
    case "savings":
      return "Savings";
    case "credit":
      return "Credit";
    case "loan":
      return "Loan";
    case "investment":
      return "Investment";
  }
}
