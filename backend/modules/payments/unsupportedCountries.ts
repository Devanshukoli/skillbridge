export const STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES = ['IN', 'AE', 'TH'] as const;

// Developers should periodically verify this list against Stripe documentation.
export function isStripeSelfServeUnsupported(countryCode?: string): boolean {
  if (!countryCode) return false;
  return STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES.includes(countryCode.trim().toUpperCase() as (typeof STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES)[number]);
}
