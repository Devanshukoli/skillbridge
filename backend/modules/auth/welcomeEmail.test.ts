import test from 'node:test';
import assert from 'node:assert/strict';
import { sendWelcomeEmail } from './welcomeEmail';

test('returns a not-configured result when SMTP settings are absent', async () => {
  const result = await sendWelcomeEmail({
    name: 'Ada',
    email: 'ada@example.com',
    appUrl: 'http://localhost:3000'
  });

  assert.equal(result.sent, false);
  assert.equal(result.reason, 'not-configured');
});
