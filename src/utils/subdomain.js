/**
 * Mirrors mostlink-node/lib/subdomain.js — the server is the authority, this is
 * for immediate feedback (and to avoid asking whether an unusable subdomain is
 * free). A site is served at <subdomain>.mostlink.co, so the value has to be a
 * valid DNS label or the host can never be routed to it.
 */
export const SUBDOMAIN_MAX_LENGTH = 63;

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

const RESERVED = new Set([
  "admin",
  "api",
  "app",
  "assets",
  "blog",
  "cdn",
  "dashboard",
  "dev",
  "docs",
  "ftp",
  "help",
  "mail",
  "mostl",
  "mostlink",
  "ns",
  "smtp",
  "static",
  "status",
  "support",
  "test",
  "webmail",
  "www",
]);

/** Hosts are case-insensitive; the server stores the normalized form. */
export function normalizeSubdomain(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

/** @returns {string|null} the problem with this subdomain, or null when it is usable. */
export function subdomainFormatError(raw) {
  const subdomain = normalizeSubdomain(raw);

  if (!subdomain) {
    return null;
  }
  if (/\s/.test(subdomain)) {
    return "No spaces allowed.";
  }
  if (subdomain.length > SUBDOMAIN_MAX_LENGTH) {
    return `Subdomains can be at most ${SUBDOMAIN_MAX_LENGTH} characters.`;
  }
  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    return "Subdomains can use lowercase letters, numbers and hyphens only, and cannot start or end with a hyphen.";
  }
  if (RESERVED.has(subdomain)) {
    return "That subdomain is reserved.";
  }

  return null;
}
