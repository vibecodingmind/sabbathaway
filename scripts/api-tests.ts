/**
 * AdventistStay expanded API test suite
 * Usage: npx tsx scripts/api-tests.ts
 */
const BASE = process.env.APP_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

async function req(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function ok(cond: unknown, msg: string) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

async function main() {
  console.log(`API tests → ${BASE}\n`);

  console.log('Health & config');
  const health = await req('/health');
  ok(health.status === 200 && health.data?.status === 'HEALTHY', 'health healthy');
  ok(Boolean(health.data?.persistence), `persistence=${health.data?.persistence}`);
  const payCfg = await req('/payments/config');
  ok(payCfg.status === 200, 'payments config');

  console.log('\nAuth');
  const badLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'guest@test.local', password: 'wrong' }),
  });
  ok(badLogin.status === 401, 'rejects bad password');

  const guestLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'guest@test.local', password: 'password123' }),
  });
  ok(guestLogin.status === 200 && guestLogin.data?.token, 'guest login');
  const guestToken = guestLogin.data?.token as string;

  const hostLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'host@test.local', password: 'password123' }),
  });
  ok(hostLogin.status === 200 && hostLogin.data?.token, 'host login');
  const hostToken = hostLogin.data?.token as string;

  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@test.local', password: 'password123' }),
  });
  ok(adminLogin.status === 200 && adminLogin.data?.token, 'admin login');
  const adminToken = adminLogin.data?.token as string;

  const me = await req('/auth/me', { headers: { Authorization: `Bearer ${guestToken}` } });
  ok(me.status === 200 && me.data?.email === 'guest@test.local', 'auth/me');

  console.log('\nBootstrap & listings');
  const bootstrap = await req('/bootstrap', {
    headers: { Authorization: `Bearer ${guestToken}` },
  });
  ok(bootstrap.status === 200, 'bootstrap');
  ok((bootstrap.data?.listings?.length || 0) >= 1, 'has listings');
  ok((bootstrap.data?.churches?.length || 0) >= 1, 'has churches');

  const listings = await req('/listings');
  ok(listings.status === 200 && Array.isArray(listings.data), 'public listings');
  const listingId = listings.data?.[0]?.id || bootstrap.data?.listings?.[0]?.id;

  console.log('\nStay lifecycle');
  const stay = await req('/stays', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({
      listingId,
      checkInDate: '2026-11-06',
      checkOutDate: '2026-11-08',
      guestCount: 1,
      purpose: 'WORSHIP_VISIT',
      purposeNote: 'API test stay',
    }),
  });
  ok(stay.status === 201 || stay.status === 200, `create stay (${stay.status})`);
  const stayId = stay.data?.id;

  if (stayId) {
    const approve = await req(`/stays/${stayId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${hostToken}` },
      body: JSON.stringify({ status: 'APPROVED', checkInInstructions: 'API test check-in' }),
    });
    ok(approve.status === 200 && approve.data?.status === 'APPROVED', 'host approve stay');
  } else {
    ok(false, 'stay id missing — skip approve');
  }

  console.log('\nMessaging');
  const msg = await req('/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({
      receiverId: hostLogin.data?.user?.id || 'user-host-1',
      content: 'Shalom — API test message',
      stayRequestId: stayId,
    }),
  });
  ok(msg.status === 201 || msg.status === 200, 'send message');

  console.log('\nVerification upload');
  const form = new FormData();
  form.append('churchName', 'Pioneer Memorial Church');
  form.append('conference', 'Michigan Conference');
  form.append('pastorName', 'Pr. Test');
  form.append('pastorEmail', 'pastor@test.local');
  form.append('pastorPhone', '+1 555 0100');
  form.append('documentType', 'MEMBERSHIP_LETTER');
  form.append(
    'document',
    new Blob([Buffer.from('%PDF-1.4 api-test')], { type: 'application/pdf' }),
    'membership-letter.pdf'
  );
  const ver = await req('/verifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: form,
  });
  ok(ver.status === 201 || ver.status === 200, `verification submit (${ver.status})`);
  ok(Boolean(ver.data?.documentUrl) || ver.status >= 400, 'document url when accepted');

  console.log('\nMembership');
  const sub = await req('/memberships/subscribe', {
    method: 'POST',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({
      plan: 'SABBATH_MEMBER',
      provider: 'free',
      householdName: 'API Test Household',
    }),
  });
  ok(sub.status === 201 || sub.status === 200, 'subscribe free path');

  console.log('\nAdmin');
  const usersPatch = await req(`/users/${hostLogin.data?.user?.id || 'user-host-1'}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ bio: 'Updated by API test' }),
  });
  ok(usersPatch.status === 200, 'admin update user');

  const guestForbidden = await req(`/users/${hostLogin.data?.user?.id || 'user-host-1'}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${guestToken}` },
    body: JSON.stringify({ bio: 'should fail' }),
  });
  ok(guestForbidden.status === 403 || guestForbidden.status === 401, 'guest cannot admin-patch user');

  console.log('\nFavorites');
  if (listingId) {
    const fav = await req(`/favorites/${listingId}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    ok(fav.status === 200, 'toggle favorite');
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
