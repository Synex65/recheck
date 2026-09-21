export const OPERATOR_ENV_KEYS = {
  name: "RECHECK_OPERATOR_NAME",
  address: "RECHECK_OPERATOR_ADDRESS",
  email: "RECHECK_CONTACT_EMAIL",
} as const;

export const OPERATOR_PLACEHOLDERS = {
  name: "TODO — legal entity unknown. To be completed by Arda / Synex65 before a public launch. Synex65 is a GitHub account, not a registered company name.",
  address: "TODO — postal address not provided.",
  email: "TODO — contact email not provided. Set RECHECK_CONTACT_EMAIL.",
  phone: "TODO — phone number not provided.",
  register:
    "TODO — not provided. No commercial register number is published, because none has been supplied.",
  vat: "TODO — not provided. No VAT identification number is published, because none has been supplied.",
} as const;

export type OperatorInput = {
  name?: string | null;
  address?: string | null;
  email?: string | null;
};

export type Operator = {
  name: string | null;
  address: string | null;
  email: string | null;
};

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/\\n/g, "\n");
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveOperator(input: OperatorInput = {}): Operator {
  return {
    name: clean(input.name),
    address: clean(input.address),
    email: clean(input.email),
  };
}

export function readOperatorFromEnv(): Operator {
  return resolveOperator({
    name: process.env[OPERATOR_ENV_KEYS.name],
    address: process.env[OPERATOR_ENV_KEYS.address],
    email: process.env[OPERATOR_ENV_KEYS.email],
  });
}

export function displayOperatorField(
  value: string | null,
  missing: string,
): { text: string; placeholder: boolean } {
  if (value) return { text: value, placeholder: false };
  return { text: missing, placeholder: true };
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
