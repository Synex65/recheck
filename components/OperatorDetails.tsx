import {
  OPERATOR_PLACEHOLDERS,
  displayOperatorField,
  isEmail,
  readOperatorFromEnv,
} from "@/lib/operator";

const ROWS = [
  { label: "Operator (Diensteanbieter)", key: "name", missing: OPERATOR_PLACEHOLDERS.name },
  { label: "Address (Anschrift)", key: "address", missing: OPERATOR_PLACEHOLDERS.address },
  { label: "Email", key: "email", missing: OPERATOR_PLACEHOLDERS.email },
  { label: "Phone", key: "phone", missing: OPERATOR_PLACEHOLDERS.phone },
  { label: "Commercial register", key: "register", missing: OPERATOR_PLACEHOLDERS.register },
  { label: "VAT ID", key: "vat", missing: OPERATOR_PLACEHOLDERS.vat },
] as const;

export function OperatorDetails() {
  const operator = readOperatorFromEnv();
  const values: Record<string, string | null> = {
    name: operator.name,
    address: operator.address,
    email: operator.email,
    phone: null,
    register: null,
    vat: null,
  };

  return (
    <dl className="operator-list">
      {ROWS.map((row) => {
        const field = displayOperatorField(values[row.key], row.missing);
        const email = row.key === "email" && !field.placeholder && isEmail(field.text);
        return (
          <div
            key={row.key}
            className={field.placeholder ? "operator-row operator-row-todo" : "operator-row"}
          >
            <dt>{row.label}</dt>
            <dd className="whitespace-pre-line">
              {email ? (
                <a className="link-action" href={`mailto:${field.text}`}>
                  {field.text}
                </a>
              ) : (
                field.text
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
