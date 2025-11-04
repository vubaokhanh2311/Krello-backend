export function parseSelectFields(
  fields?: string,
  defaultFields: Record<string, boolean> = {},
) {
  return fields
    ? Object.fromEntries(fields.split(',').map((f) => [f.trim(), true]))
    : defaultFields;
}
