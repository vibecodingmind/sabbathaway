/**
 * AdventistStay API smoke tests
 * Usage: npx tsx scripts/smoke-api.ts
 * Requires: server running on PORT (default 3000) with seeded DB
 */
const BASE = process.env.APP_URL || 'http://localhost:3000';

async function req(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`Smoke testing ${BASE} …`);

  const health = await req('/health');
  assert(health.status === 200, 'health failed');
  assert(health.data?.status === 'HEALTHY', 'health not HEALTHY');
  console.log('✓ health', health.data.integrations);

  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'guest@test.local', password: 'password123' }),
  });
  assert(login.status === 200 && login.data?.token, 'guest login failed');
  const guestToken = login.data.token as string;
  console.log('✓ guest login');

  const bootstrap = await req('/bootstrap', {
    headers: { Authorization: `Bearer ${guestToken}` },
  });
  assert(bootstrap.status === 200, 'bootstrap failed');
  assert((bootstrap.data?.listings?.length || 0) > 0, 'no listings');
  console.log(`✓ bootstrap (${bootstrap.data.listings.length} listings)`);

  const stay = await req('/stays', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({
      listingId: bootstrap.data.listings[0].id,
      checkInDate: '2026-10-02',
      checkOutDate: '2026-10-04',
      guestCount: 2,
      purpose: 'WORSHIP_VISIT',
      purposeNote: 'Smoke test stay request',
    }),
  });
  assert(stay.status === 201 || stay.status === 200, `stay create failed: ${stay.status} ${JSON.stringify(stay.data)}`);
  console.log('✓ stay request', stay.data?.id || stay.data?.status);

  const hostLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'host@test.local', password: 'password123' }),
  });
  assert(hostLogin.data?.token, 'host login failed');
  const hostToken = hostLogin.data.token as string;

  if (stay.data?.id) {
    const approve = await req(`/stays/${stay.data.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hostToken}` },
      body: JSON.stringify({
        status: 'APPROVED',
        checkInInstructions: 'Smoke test check-in instructions',
      }),
    });
    assert(approve.status === 200 && approve.data?.status === 'APPROVED', 'approve failed');
    console.log('✓ host approved stay');
  }

  const sub = await req('/memberships/subscribe', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({
      plan: 'SABBATH_MEMBER',
      provider: 'stripe',
      householdName: 'Smoke Test Household',
    }),
  });
  assert(sub.status === 201 || sub.status === 200, `subscribe failed: ${JSON.stringify(sub.data)}`);
  if (sub.data?.checkoutUrl) {
    console.log('✓ subscribe returned Stripe Checkout URL');
  } else {
    console.log('✓ subscribe activated instantly (simulated or free path)');
  }

  const payCfg = await req('/payments/config');
  assert(payCfg.status === 200, 'payments config failed');
  console.log('✓ payments config', payCfg.data);

  console.log('\nAll smoke tests passed.');
}

main().catch((err) => {
  console.error('\nSmoke tests FAILED:', err.message || err);
  process.exit(1);
});
