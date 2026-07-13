import { STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES } from './unsupportedCountries';

export function getStripeConfig() {
  return {
    unsupportedStripeCountries: [...STRIPE_SELF_SERVE_UNSUPPORTED_COUNTRIES]
  };
}
