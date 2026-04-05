/**
 * Site image fields are stored in Convex as a single string (data URL or https URL).
 * The editor may use { base64, url } objects; public pages accept either shape.
 */
export function imageFieldSrc(field) {
  if (field == null || field === "") {
    return null;
  }
  if (typeof field === "string") {
    return field;
  }
  return field.base64 || field.url || null;
}
