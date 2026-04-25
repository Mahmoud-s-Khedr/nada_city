type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type JsonObject = Record<string, unknown>;

type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type FlowResult = {
  name: string;
  passed: boolean;
  details: string[];
  error?: string;
};

type RequestOptions = {
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | boolean | undefined>;
  expectedStatus?: number;
};

type RegisterResponse = {
  userId: string;
  email: string;
  verificationRequired: boolean;
  devOtpCode?: string;
};

type ForgotPasswordResponse = {
  requested: boolean;
  devResetToken?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  isVerified: boolean;
};

type EntityWithId = {
  id: string;
};

const baseUrl = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const failFast = (process.env.API_TEST_FAIL_FAST ?? 'false') === 'true';
const jsonSummary = (process.env.API_TEST_JSON_SUMMARY ?? 'false') === 'true';
const adminEmail = process.env.API_TEST_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
const adminPassword = process.env.API_TEST_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
const runId = crypto.randomUUID().slice(0, 8);

const results: FlowResult[] = [];

let adminTokens: AuthTokens | null = null;

function log(message: string): void {
  console.log(message);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function buildUrl(pathname: string, query?: RequestOptions['query']): string {
  const url = new URL(pathname, `${baseUrl}/`);
  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function request<T>(method: HttpMethod, pathname: string, options: RequestOptions = {}): Promise<{ status: number; body: T | null; rawBody: string }> {
  const headers = new Headers();
  headers.set('Accept', 'application/json');

  let body: string | undefined;
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(buildUrl(pathname, options.query), {
    method,
    headers,
    body,
  });

  const rawBody = await response.text();
  let parsedBody: T | null = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody) as T;
    } catch {
      parsedBody = null;
    }
  }

  if (options.expectedStatus !== undefined && response.status !== options.expectedStatus) {
    throw new Error(`${method} ${pathname} expected ${options.expectedStatus} but received ${response.status}: ${rawBody}`);
  }

  return { status: response.status, body: parsedBody, rawBody };
}

async function api<T>(method: HttpMethod, pathname: string, options: RequestOptions = {}): Promise<T> {
  const response = await request<ApiEnvelope<T>>(method, pathname, options);
  assert(response.body !== null, `${method} ${pathname} returned an empty body`);
  return response.body.data;
}

async function expectStatus(method: HttpMethod, pathname: string, expectedStatus: number, options: RequestOptions = {}): Promise<void> {
  await request(method, pathname, { ...options, expectedStatus });
}

function testEmail(label: string): string {
  return `api-harness-${label}-${runId}@example.com`;
}

async function runFlow(name: string, fn: () => Promise<string[]>): Promise<void> {
  log(`\n[flow] ${name}`);
  try {
    const details = await fn();
    results.push({ name, passed: true, details });
    for (const detail of details) {
      log(`  - ${detail}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, details: [], error: message });
    log(`  x ${message}`);
    if (failFast) {
      throw error;
    }
  }
}

async function login(email: string, password: string): Promise<AuthTokens> {
  return api<AuthTokens>('POST', '/api/v1/auth/login', {
    body: { email, password },
    expectedStatus: 200,
  });
}

async function getAdminTokens(): Promise<AuthTokens> {
  if (adminTokens) {
    return adminTokens;
  }

  assert(adminEmail && adminPassword, 'Admin credentials are required. Set API_TEST_ADMIN_EMAIL and API_TEST_ADMIN_PASSWORD.');
  adminTokens = await login(adminEmail, adminPassword);
  return adminTokens;
}

async function createGalleryItem(adminAccessToken: string, suffix: string): Promise<EntityWithId> {
  return api<EntityWithId>('POST', '/api/v1/galleryItems', {
    token: adminAccessToken,
    expectedStatus: 201,
    body: {
      title: `Harness Gallery ${suffix}`,
      description: `Gallery item ${suffix}`,
      details: `Details ${suffix}`,
      keywords: `harness,${suffix}`,
      type: 'UNIT',
      imageUrls: [`https://example.com/gallery-${suffix}.jpg`],
      videoUrls: [],
    },
  });
}

async function createLocation(adminAccessToken: string, suffix: string): Promise<EntityWithId> {
  return api<EntityWithId>('POST', '/api/v1/locations', {
    token: adminAccessToken,
    expectedStatus: 201,
    body: {
      address: `Harness Address ${suffix}`,
      latitude: 30.0444,
      longitude: 31.2357,
    },
  });
}

async function createUnit(adminAccessToken: string, locationId: string, suffix: string): Promise<EntityWithId> {
  return api<EntityWithId>('POST', '/api/v1/units', {
    token: adminAccessToken,
    expectedStatus: 201,
    body: {
      title: `Harness Unit ${suffix}`,
      description: `Unit ${suffix}`,
      keywords: `unit,${suffix}`,
      price: 1500000,
      availability: 'AVAILABLE',
      type: 'RESIDENTIAL',
      imageUrls: [`https://example.com/unit-${suffix}.jpg`],
      videoUrls: [],
      location: {
        connect: { id: locationId },
      },
    },
  });
}

async function createFinish(adminAccessToken: string, suffix: string): Promise<EntityWithId> {
  return api<EntityWithId>('POST', '/api/v1/finishes', {
    token: adminAccessToken,
    expectedStatus: 201,
    body: {
      title: `Harness Finish ${suffix}`,
      description: `Finish ${suffix}`,
      price: 25000,
      type: 'INSIDE',
      subType: `Subtype ${suffix}`,
      imageUrls: [`https://example.com/finish-${suffix}.jpg`],
      videoUrls: [],
    },
  });
}

async function createFurnitureItem(adminAccessToken: string, suffix: string): Promise<EntityWithId> {
  return api<EntityWithId>('POST', '/api/v1/furnitureItems', {
    token: adminAccessToken,
    expectedStatus: 201,
    body: {
      title: `Harness Furniture ${suffix}`,
      description: `Furniture ${suffix}`,
      price: 12000,
      imageUrls: [`https://example.com/furniture-${suffix}.jpg`],
      videoUrls: [],
    },
  });
}

async function authAndSessionFlow(): Promise<{ accessToken: string; password: string; email: string }> {
  const email = testEmail('user');
  const password = 'HarnessPassword123!';
  let verifiedSession: AuthTokens | null = null;

  await runFlow('Health Check', async () => {
    const response = await request<{ status: string }>('GET', '/health', { expectedStatus: 200 });
    assert(response.body?.status === 'ok', 'Health endpoint did not return ok');
    return ['Health endpoint responded with status ok'];
  });

  await runFlow('Registration and Session', async () => {
    const register = await api<RegisterResponse>('POST', '/api/v1/auth/register', {
      expectedStatus: 200,
      body: {
        name: 'Harness User',
        email,
        password,
        phone: '+201000000000',
        address: 'Harness Address',
      },
    });

    assert(register.verificationRequired, 'Registration did not require verification');
    assert(
      register.devOtpCode,
      'Registration response did not include devOtpCode. Start the backend with EXPOSE_TEST_TOKENS=true in a non-production environment and restart it.'
    );

    await expectStatus('POST', '/api/v1/auth/login', 403, {
      body: { email, password },
    });

    await api<{ verified: boolean }>('POST', '/api/v1/auth/verify-otp', {
      expectedStatus: 200,
      body: { email, code: register.devOtpCode },
    });

    const loginResponse = await login(email, password);
    assert(loginResponse.accessToken, 'Login did not return access token');
    assert(loginResponse.refreshToken, 'Login did not return refresh token');

    const refreshed = await api<AuthTokens>('POST', '/api/v1/auth/refresh', {
      expectedStatus: 200,
      body: { refreshToken: loginResponse.refreshToken },
    });

    await expectStatus('POST', '/api/v1/auth/refresh', 401, {
      body: { refreshToken: loginResponse.refreshToken },
    });

    await request('POST', '/api/v1/auth/logout', {
      expectedStatus: 204,
      body: { refreshToken: refreshed.refreshToken },
    });

    await expectStatus('POST', '/api/v1/auth/refresh', 401, {
      body: { refreshToken: refreshed.refreshToken },
    });

    verifiedSession = refreshed;

    return [
      'Registration returned a dev OTP and blocked login before verification',
      'OTP verification succeeded and login returned access/refresh tokens',
      'Refresh invalidated the previous refresh token and logout invalidated the active refresh token',
    ];
  });

  assert(verifiedSession, 'Registration and Session flow failed; the harness cannot continue.');
  const loginResponse = await login(email, password);
  return { accessToken: loginResponse.accessToken, password, email };
}

async function passwordRecoveryFlow(email: string): Promise<{ password: string }> {
  const newPassword = 'HarnessPassword456!';
  let changed = false;

  await runFlow('Password Recovery', async () => {
    const forgot = await api<ForgotPasswordResponse>('POST', '/api/v1/auth/forgot-password', {
      expectedStatus: 200,
      body: { email },
    });
    assert(forgot.requested, 'Forgot-password did not acknowledge the request');
    assert(
      forgot.devResetToken,
      'Forgot-password response did not include devResetToken. Start the backend with EXPOSE_TEST_TOKENS=true in a non-production environment and restart it.'
    );

    await api<{ changed?: boolean }>('POST', '/api/v1/auth/reset-password', {
      expectedStatus: 200,
      body: {
        token: forgot.devResetToken,
        password: newPassword,
        confirmPassword: newPassword,
      },
    });

    await expectStatus('POST', '/api/v1/auth/reset-password', 401, {
      body: {
        token: forgot.devResetToken,
        password: `${newPassword}A`,
        confirmPassword: `${newPassword}A`,
      },
    });

    const loginResponse = await login(email, newPassword);
    assert(loginResponse.accessToken, 'Login with reset password failed');
    changed = true;

    return [
      'Forgot-password returned a dev reset token',
      'Reset-password consumed the token and blocked reuse',
      'Login with the new password succeeded',
    ];
  });

  assert(changed, 'Password Recovery flow failed; the harness cannot continue.');
  return { password: newPassword };
}

async function profileFlow(email: string, currentPassword: string): Promise<{ accessToken: string; password: string }> {
  let activePassword = currentPassword;
  let session = await login(email, activePassword);
  let completed = false;

  await runFlow('Profile and Password Management', async () => {
    const me = await api<UserProfile>('GET', '/api/v1/users/me', {
      token: session.accessToken,
      expectedStatus: 200,
    });
    assert(me.email === email, 'Current profile email mismatch');

    const updated = await api<UserProfile>('PATCH', '/api/v1/users/me', {
      token: session.accessToken,
      expectedStatus: 200,
      body: {
        name: 'Harness User Updated',
        phone: '+201111111111',
        address: 'Updated Harness Address',
      },
    });
    assert(updated.name === 'Harness User Updated', 'Profile update did not persist name');

    await expectStatus('POST', '/api/v1/users/me/change-password', 401, {
      token: session.accessToken,
      body: {
        oldPassword: 'WrongPassword123!',
        newPassword: 'HarnessPassword789!',
        confirmPassword: 'HarnessPassword789!',
      },
    });

    activePassword = 'HarnessPassword789!';
    await api<{ changed: boolean }>('POST', '/api/v1/users/me/change-password', {
      token: session.accessToken,
      expectedStatus: 200,
      body: {
        oldPassword: currentPassword,
        newPassword: activePassword,
        confirmPassword: activePassword,
      },
    });

    session = await login(email, activePassword);
    completed = true;

    return [
      'GET /users/me returned the authenticated profile',
      'PATCH /users/me updated name, phone, and address',
      'Change-password rejected the wrong old password and accepted the correct one',
    ];
  });

  assert(completed, 'Profile and Password Management flow failed; the harness cannot continue.');
  return { accessToken: session.accessToken, password: activePassword };
}

async function galleryFlow(userToken: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Gallery, Comments, Reactions, and Favorites', async () => {
    const galleryRead = await request<ApiEnvelope<JsonObject[]>>('GET', '/api/v1/galleryItems', {
      expectedStatus: 200,
      query: {
        'filter[type]': 'UNIT',
        search: 'Harness',
        sort: 'createdAt',
        order: 'desc',
        include: 'comments,reactions,favorites',
      },
    });
    assert(Array.isArray(galleryRead.body?.data), 'Gallery list did not return an array');

    const adminManaged = await createGalleryItem(admin.accessToken, `gallery-${runId}`);
    await api<EntityWithId>('PATCH', `/api/v1/galleryItems/${adminManaged.id}`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        details: 'Updated by harness patch',
      },
    });

    const adminDeleted = await createGalleryItem(admin.accessToken, `gallery-delete-${runId}`);
    await request('DELETE', `/api/v1/galleryItems/${adminDeleted.id}`, {
      token: admin.accessToken,
      expectedStatus: 204,
    });

    const galleryItem = await api<JsonObject>('GET', `/api/v1/galleryItems/${adminManaged.id}`, {
      expectedStatus: 200,
    });
    assert(galleryItem.id === adminManaged.id, 'Gallery item lookup returned the wrong record');

    await expectStatus('POST', '/api/v1/comments', 401, {
      body: { body: 'Unauthorized comment', galleryItemId: adminManaged.id },
    });
    const comment = await api<EntityWithId>('POST', '/api/v1/comments', {
      token: userToken,
      expectedStatus: 201,
      body: { body: 'Harness comment', galleryItemId: adminManaged.id },
    });
    await api<EntityWithId>('PATCH', `/api/v1/comments/${comment.id}`, {
      token: userToken,
      expectedStatus: 200,
      body: { body: 'Harness comment updated' },
    });
    await request('DELETE', `/api/v1/comments/${comment.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    await expectStatus('POST', '/api/v1/reactions', 401, {
      body: { galleryItemId: adminManaged.id, type: 'LIKE' },
    });
    const reaction = await api<EntityWithId>('POST', '/api/v1/reactions', {
      token: userToken,
      expectedStatus: 201,
      body: { galleryItemId: adminManaged.id, type: 'LIKE' },
    });
    await api<EntityWithId>('PATCH', `/api/v1/reactions/${reaction.id}`, {
      token: userToken,
      expectedStatus: 200,
      body: { type: 'LOVE' },
    });
    await request('DELETE', `/api/v1/reactions/${reaction.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    await expectStatus('POST', '/api/v1/favorites', 401, {
      body: { type: 'GALLERY_ITEM', galleryItemId: adminManaged.id },
    });
    const favorite = await api<EntityWithId>('POST', '/api/v1/favorites', {
      token: userToken,
      expectedStatus: 201,
      body: { type: 'GALLERY_ITEM', galleryItemId: adminManaged.id },
    });
    const favorites = await api<JsonObject[]>('GET', '/api/v1/favorites', {
      token: userToken,
      expectedStatus: 200,
      query: { 'filter[type]': 'GALLERY_ITEM' },
    });
    assert(favorites.some((item) => item.id === favorite.id), 'Favorite listing did not include the created favorite');
    await request('DELETE', `/api/v1/favorites/${favorite.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    return [
      'Public gallery list and detail endpoints returned data',
      'Admin gallery create, patch, and delete flows succeeded',
      'Comment, reaction, and favorite writes were rejected without auth and succeeded after login',
    ];
  });
}

async function bookingFlow(userToken: string): Promise<{ locationId: string; unitId: string }> {
  const admin = await getAdminTokens();
  const location = await createLocation(admin.accessToken, `booking-${runId}`);
  const unit = await createUnit(admin.accessToken, location.id, `booking-${runId}`);

  await runFlow('Unit Discovery and Booking Requests', async () => {
    const units = await api<JsonObject[]>('GET', '/api/v1/units', {
      expectedStatus: 200,
      query: {
        search: 'Harness Unit',
        'filter[locationId]': location.id,
        sort: 'createdAt',
        order: 'desc',
        include: 'location',
      },
    });
    assert(units.some((item) => item.id === unit.id), 'Units list did not include the created unit');

    const unitDetail = await api<JsonObject>('GET', `/api/v1/units/${unit.id}`, {
      expectedStatus: 200,
      query: { include: 'location' },
    });
    assert(unitDetail.id === unit.id, 'Unit detail returned the wrong unit');

    const cancellable = await api<EntityWithId>('POST', '/api/v1/bookingRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        unitId: unit.id,
        name: 'Booking User',
        phone: '+201200000000',
        address: 'Booking Address',
        details: 'Pending cancellation test',
      },
    });
    const bookingHistory = await api<JsonObject[]>('GET', '/api/v1/bookingRequests/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(bookingHistory.some((item) => item.id === cancellable.id), 'Booking history did not include the created request');

    const bookingDetail = await api<JsonObject>('GET', `/api/v1/bookingRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });
    assert(bookingDetail.id === cancellable.id, 'Booking detail returned the wrong request');

    await request('DELETE', `/api/v1/bookingRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/bookingRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        unitId: unit.id,
        name: 'Booking Review User',
        phone: '+201300000000',
        address: 'Booking Review Address',
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/bookingRequests', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING', unitId: unit.id },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin booking list did not include the pending request');

    const reviewed = await api<JsonObject>('PATCH', `/api/v1/bookingRequests/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'ACCEPTED',
        adminNote: 'Approved by harness',
      },
    });
    assert(reviewed.status === 'ACCEPTED', 'Booking review did not update the status');

    return [
      'Public unit list and detail endpoints returned the created unit',
      'Pending booking requests were visible to the owner and cancellable',
      'Admin review moved a booking request out of PENDING',
    ];
  });

  return { locationId: location.id, unitId: unit.id };
}

async function sellUnitFlow(userToken: string, locationId: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Sell Unit Requests', async () => {
    const cancellable = await api<EntityWithId>('POST', '/api/v1/sellUnitRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        title: `Sell Unit ${runId}`,
        description: 'Sell request for cancellation',
        price: 1700000,
        type: 'RESIDENTIAL',
        address: 'Sell Address',
        locationId,
        imageUrls: ['https://example.com/sell.jpg'],
        videoUrls: [],
      },
    });

    const history = await api<JsonObject[]>('GET', '/api/v1/sellUnitRequests/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(history.some((item) => item.id === cancellable.id), 'Sell request history did not include the created request');

    const detail = await api<JsonObject>('GET', `/api/v1/sellUnitRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });
    assert(detail.id === cancellable.id, 'Sell request detail returned the wrong request');

    await request('DELETE', `/api/v1/sellUnitRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/sellUnitRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        title: `Sell Review ${runId}`,
        description: 'Sell request for acceptance',
        price: 1800000,
        type: 'COMMERCIAL',
        address: 'Sell Review Address',
        locationId,
        details: 'Create a unit when accepted',
        imageUrls: ['https://example.com/sell-review.jpg'],
        videoUrls: [],
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/sellUnitRequests', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING' },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin sell-unit list did not include the pending request');

    const reviewResult = await api<{ updated: JsonObject; unit: JsonObject }>('PATCH', `/api/v1/sellUnitRequests/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'ACCEPTED',
        adminNote: 'Accepted by harness',
        locationId,
      },
    });

    assert(reviewResult.updated.status === 'ACCEPTED', 'Sell request review did not accept the request');
    assert(reviewResult.unit.acceptedSellRequestId === reviewable.id, 'Accepted sell request did not create a linked unit');

    return [
      'Sell request history and detail endpoints returned the user records',
      'Pending sell requests were cancellable by the owner',
      'Admin acceptance created a linked unit record',
    ];
  });
}

async function unitOrderFlow(userToken: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Unit Order Requests', async () => {
    const cancellable = await api<EntityWithId>('POST', '/api/v1/unitOrderRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        title: 'Desired Unit',
        description: 'Order request for cancellation',
        minPrice: 800000,
        maxPrice: 1400000,
        type: 'RESIDENTIAL',
        address: 'Desired Address',
        location: 'Cairo',
      },
    });

    const history = await api<JsonObject[]>('GET', '/api/v1/unitOrderRequests/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(history.some((item) => item.id === cancellable.id), 'Unit order history did not include the created request');

    await api<JsonObject>('GET', `/api/v1/unitOrderRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });

    await request('DELETE', `/api/v1/unitOrderRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/unitOrderRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        title: 'Desired Unit Review',
        description: 'Order request for review',
        minPrice: 900000,
        maxPrice: 1600000,
        type: 'COMMERCIAL',
        address: 'Review Address',
        location: 'Giza',
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/unitOrderRequests', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING' },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin unit-order list did not include the pending request');

    const reviewed = await api<JsonObject>('PATCH', `/api/v1/unitOrderRequests/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'AVAILABLE',
        adminNote: 'Now available',
      },
    });
    assert(reviewed.status === 'AVAILABLE', 'Unit order review did not mark the request as AVAILABLE');

    return [
      'Unit order create, history, and detail endpoints worked for the authenticated user',
      'Pending unit order requests were cancellable by the owner',
      'Admin review handled the AVAILABLE branch',
    ];
  });
}

async function finishFlow(userToken: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Finishes and Finish Requests', async () => {
    const managed = await createFinish(admin.accessToken, `finish-${runId}`);
    await api<EntityWithId>('PUT', `/api/v1/finishes/${managed.id}`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        title: `Harness Finish ${runId} Updated`,
        description: 'Finish updated via PUT',
        price: 27000,
        type: 'OUTSIDE',
        subType: 'Exterior',
        imageUrls: ['https://example.com/finish-put.jpg'],
        videoUrls: [],
      },
    });

    const deletable = await createFinish(admin.accessToken, `finish-delete-${runId}`);
    await request('DELETE', `/api/v1/finishes/${deletable.id}`, {
      token: admin.accessToken,
      expectedStatus: 204,
    });

    const finishes = await api<JsonObject[]>('GET', '/api/v1/finishes', {
      expectedStatus: 200,
      query: { search: 'Harness Finish', sort: 'createdAt', order: 'desc' },
    });
    assert(finishes.some((item) => item.id === managed.id), 'Finish list did not include the managed finish');

    await api<JsonObject>('GET', `/api/v1/finishes/${managed.id}`, {
      expectedStatus: 200,
    });

    const cancellable = await api<EntityWithId>('POST', '/api/v1/finishRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        finishId: managed.id,
        address: 'Finish Address',
        requestedAt: new Date().toISOString(),
        finishTypes: ['Paint', 'Lighting'],
        details: 'Cancel this finish request',
      },
    });

    const history = await api<JsonObject[]>('GET', '/api/v1/finishRequests/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(history.some((item) => item.id === cancellable.id), 'Finish request history did not include the created request');

    await api<JsonObject>('GET', `/api/v1/finishRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });

    await request('DELETE', `/api/v1/finishRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/finishRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        finishId: managed.id,
        address: 'Finish Review Address',
        requestedAt: new Date().toISOString(),
        finishTypes: ['Flooring'],
        details: 'Review this finish request',
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/finishRequests', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING', finishId: managed.id },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin finish-request list did not include the pending request');

    const reviewed = await api<JsonObject>('PATCH', `/api/v1/finishRequests/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'ACCEPTED',
        adminNote: 'Finish request approved',
      },
    });
    assert(reviewed.status === 'ACCEPTED', 'Finish review did not accept the request');

    return [
      'Admin finish catalog create, PUT update, and delete flows succeeded',
      'Public finish browse endpoints returned the managed finish',
      'Finish request create, cancel, history, and admin review flows succeeded',
    ];
  });
}

async function furnitureFlow(userToken: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Furniture Catalog and Bookings', async () => {
    const managed = await createFurnitureItem(admin.accessToken, `furniture-${runId}`);
    await api<EntityWithId>('PUT', `/api/v1/furnitureItems/${managed.id}`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        title: `Harness Furniture ${runId} Updated`,
        description: 'Furniture updated via PUT',
        price: 13000,
        imageUrls: ['https://example.com/furniture-put.jpg'],
        videoUrls: [],
      },
    });

    const deletable = await createFurnitureItem(admin.accessToken, `furniture-delete-${runId}`);
    await request('DELETE', `/api/v1/furnitureItems/${deletable.id}`, {
      token: admin.accessToken,
      expectedStatus: 204,
    });

    const furnitureList = await api<JsonObject[]>('GET', '/api/v1/furnitureItems', {
      expectedStatus: 200,
      query: { search: 'Harness Furniture', sort: 'createdAt', order: 'desc' },
    });
    assert(furnitureList.some((item) => item.id === managed.id), 'Furniture list did not include the managed item');

    await api<JsonObject>('GET', `/api/v1/furnitureItems/${managed.id}`, {
      expectedStatus: 200,
    });

    const cancellable = await api<EntityWithId>('POST', '/api/v1/furnitureBookings', {
      token: userToken,
      expectedStatus: 201,
      body: {
        furnitureItemId: managed.id,
        name: 'Furniture User',
        phone: '+201400000000',
        address: 'Furniture Address',
        details: 'Cancel this booking',
      },
    });

    const history = await api<JsonObject[]>('GET', '/api/v1/furnitureBookings/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(history.some((item) => item.id === cancellable.id), 'Furniture booking history did not include the created request');

    await api<JsonObject>('GET', `/api/v1/furnitureBookings/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });

    await request('DELETE', `/api/v1/furnitureBookings/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/furnitureBookings', {
      token: userToken,
      expectedStatus: 201,
      body: {
        furnitureItemId: managed.id,
        name: 'Furniture Review User',
        phone: '+201500000000',
        address: 'Furniture Review Address',
        details: 'Review this booking',
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/furnitureBookings', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING', furnitureItemId: managed.id },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin furniture-booking list did not include the pending request');

    const reviewed = await api<JsonObject>('PATCH', `/api/v1/furnitureBookings/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'ACCEPTED',
        adminNote: 'Furniture booking approved',
      },
    });
    assert(reviewed.status === 'ACCEPTED', 'Furniture booking review did not accept the request');

    return [
      'Admin furniture catalog create, PUT update, and delete flows succeeded',
      'Public furniture browse endpoints returned the managed item',
      'Furniture booking create, cancel, history, and admin review flows succeeded',
    ];
  });
}

async function specialFurnitureFlow(userToken: string): Promise<void> {
  const admin = await getAdminTokens();

  await runFlow('Special Furniture Requests', async () => {
    const cancellable = await api<EntityWithId>('POST', '/api/v1/specialFurnitureRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        name: 'Special Request User',
        phone: '+201600000000',
        details: 'Custom furniture request to cancel',
      },
    });

    const history = await api<JsonObject[]>('GET', '/api/v1/specialFurnitureRequests/me', {
      token: userToken,
      expectedStatus: 200,
    });
    assert(history.some((item) => item.id === cancellable.id), 'Special furniture history did not include the created request');

    await api<JsonObject>('GET', `/api/v1/specialFurnitureRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 200,
    });

    await request('DELETE', `/api/v1/specialFurnitureRequests/${cancellable.id}`, {
      token: userToken,
      expectedStatus: 204,
    });

    const reviewable = await api<EntityWithId>('POST', '/api/v1/specialFurnitureRequests', {
      token: userToken,
      expectedStatus: 201,
      body: {
        name: 'Special Request Review User',
        phone: '+201700000000',
        details: 'Custom furniture request for review',
      },
    });

    const adminList = await api<JsonObject[]>('GET', '/api/v1/specialFurnitureRequests', {
      token: admin.accessToken,
      expectedStatus: 200,
      query: { status: 'PENDING' },
    });
    assert(adminList.some((item) => item.id === reviewable.id), 'Admin special-furniture list did not include the pending request');

    const reviewed = await api<JsonObject>('PATCH', `/api/v1/specialFurnitureRequests/${reviewable.id}/review`, {
      token: admin.accessToken,
      expectedStatus: 200,
      body: {
        status: 'ACCEPTED',
        adminNote: 'Special furniture request approved',
      },
    });
    assert(reviewed.status === 'ACCEPTED', 'Special furniture review did not accept the request');

    return [
      'Special furniture request create, history, and detail endpoints worked for the user',
      'Pending special furniture requests were cancellable by the owner',
      'Admin review moved a special furniture request out of PENDING',
    ];
  });
}

async function whatsappFlow(userToken: string, targetId: string): Promise<void> {
  await runFlow('WhatsApp Open Event Tracking', async () => {
    const created = await api<EntityWithId>('POST', '/api/v1/whatsappOpenEvents', {
      token: userToken,
      expectedStatus: 201,
      body: {
        module: 'GALLERY',
        targetId,
        defaultMessage: 'Hello from the harness',
      },
    });

    const list = await api<JsonObject[]>('GET', '/api/v1/whatsappOpenEvents', {
      token: userToken,
      expectedStatus: 200,
      query: { 'filter[module]': 'GALLERY' },
    });
    assert(list.some((item) => item.id === created.id), 'WhatsApp event list did not include the created record');

    const detail = await api<JsonObject>('GET', `/api/v1/whatsappOpenEvents/${created.id}`, {
      token: userToken,
      expectedStatus: 200,
    });
    assert(detail.id === created.id, 'WhatsApp event detail returned the wrong record');

    return [
      'WhatsApp open event creation succeeded for an authenticated user',
      'WhatsApp event list and detail reads returned the created record',
    ];
  });
}

function printSummary(): void {
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;

  log('\nSummary');
  log(`- Base URL: ${baseUrl}`);
  log(`- Flows passed: ${passed}`);
  log(`- Flows failed: ${failed}`);

  if (failed > 0) {
    for (const result of results.filter((item) => !item.passed)) {
      log(`- ${result.name}: ${result.error}`);
    }
  }

  if (jsonSummary) {
    console.log(JSON.stringify({ baseUrl, results }, null, 2));
  }
}

async function main(): Promise<void> {
  const session = await authAndSessionFlow();
  const recovered = await passwordRecoveryFlow(session.email);
  const profile = await profileFlow(session.email, recovered.password);

  await galleryFlow(profile.accessToken);
  const bookingFixtures = await bookingFlow(profile.accessToken);
  await sellUnitFlow(profile.accessToken, bookingFixtures.locationId);
  await unitOrderFlow(profile.accessToken);
  await finishFlow(profile.accessToken);
  await furnitureFlow(profile.accessToken);
  await specialFurnitureFlow(profile.accessToken);
  await whatsappFlow(profile.accessToken, bookingFixtures.unitId);

  printSummary();

  if (results.some((result) => !result.passed)) {
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  log(`\nFatal error: ${message}`);
  printSummary();
  process.exit(1);
});
