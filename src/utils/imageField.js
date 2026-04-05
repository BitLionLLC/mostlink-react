/**
 * Site image fields are stored in Convex as a single string (data URL, https URL, or storage: ref).
 * The editor may use { base64, url } objects; public pages accept either shape.
 */
export function imageFieldRaw(field) {
  if (field == null || field === "") {
    return null;
  }
  if (typeof field === "string") {
    return field;
  }
  return field.base64 || field.url || null;
}

/** For <img src>; storage refs need a resolved URL from the API. */
export function imageFieldSrc(field) {
  const raw = imageFieldRaw(field);
  if (raw == null || raw === "") {
    return null;
  }
  if (typeof raw === "string" && raw.startsWith("storage:")) {
    return null;
  }
  return raw;
}
