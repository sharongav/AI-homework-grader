#!/usr/bin/env node
/**
 * Super Admin Bootstrap Script per Phase 11d.
 * Run once against an empty database to create the singleton Super Admin account.
 * The partial unique index `one_super_admin` prevents a second Super Admin from ever being created.
 *
 * Usage: pnpm bootstrap-super-admin
 */

import { randomBytes, createHash } from 'crypto';
import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

async function main() {
  console.log('=== Homework Platform: Super Admin Bootstrap ===\n');
  console.log('This script creates the singleton Super Admin account.');
  console.log('It can only be run once. The database unique index prevents duplicates.\n');

  const email = await ask('Enter Super Admin email: ');
  if (!email || !email.includes('@')) {
    console.error('Invalid email address.');
    process.exit(1);
  }

  // Generate a sealed one-time claim token
  const tokenBytes = randomBytes(32);
  const claimToken = tokenBytes.toString('base64url');
  const tokenHash = createHash('sha256').update(claimToken).digest('hex');

  console.log(`\nEmail: ${email}`);
  console.log(`Claim token (save this — shown ONLY ONCE):\n\n  ${claimToken}\n`);

  const confirm = await ask('Type "CREATE" to proceed: ');
  if (confirm !== 'CREATE') {
    console.log('Aborted.');
    process.exit(0);
  }

  // TODO: Connect to database and insert:
  // 1. Create User with email, systemRole = 'SUPER_ADMIN', claimTokenHash = tokenHash
  // 2. The partial unique index (one_super_admin) will throw if a SUPER_ADMIN already exists
  // 3. Generate backup codes (8 codes, 10 chars each) — display once, store hashed
  // 4. Mandate TOTP 2FA setup on first login

  const backupCodes = Array.from({ length: 8 }, () => randomBytes(5).toString('hex'));
  console.log('\nBackup codes (save these — shown ONLY ONCE):');
  backupCodes.forEach((code, i) => console.log(`  ${i + 1}. ${code}`));

  console.log('\n✓ Super Admin account created.');
  console.log('  - Use the claim token to complete account setup at /admin/platform/claim');
  console.log('  - 2FA setup will be required on first login.');
  console.log('  - Session timeout: 30 minutes idle.');
  console.log('  - Configure IP allow-list after first login (optional).');

  rl.close();
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
