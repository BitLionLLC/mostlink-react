/**
 * Hosted sites live at <subdomain>.<REACT_APP_HOSTED_BASE> once deployed; locally
 * the Next host serves them path-style off REACT_APP_HOSTED_BASE instead.
 */
const isHostedEnvironment =
  process.env.REACT_APP_ENVIRONMENT === "production" ||
  process.env.REACT_APP_ENVIRONMENT === "development";

export function publicSiteUrl(subdomain) {
  if (isHostedEnvironment) {
    return `https://${subdomain}.${process.env.REACT_APP_HOSTED_BASE}`;
  }
  return `${process.env.REACT_APP_HOSTED_BASE}/${subdomain}`;
}

/** The same URL without the scheme, for display next to a link. */
export function publicSiteLabel(subdomain) {
  return publicSiteUrl(subdomain).replace(/^https?:\/\//, "");
}
