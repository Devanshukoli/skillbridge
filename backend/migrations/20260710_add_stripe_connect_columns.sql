alter table skillbridge_users
  add column if not exists stripe_account_id text,
  add column if not exists stripe_connected boolean not null default false,
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_payouts_enabled boolean not null default false,
  add column if not exists stripe_onboarding_completed boolean not null default false,
  add column if not exists stripe_updated_at timestamptz,
  add column if not exists stripe_requirements_currently_due text[] not null default '{}';

create unique index if not exists skillbridge_users_stripe_account_id_idx
  on skillbridge_users (stripe_account_id)
  where stripe_account_id is not null;
