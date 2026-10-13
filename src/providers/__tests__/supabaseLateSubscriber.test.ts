// @vitest-environment jsdom
import { type AuthChangeEvent, type Session, createClient } from '@supabase/supabase-js';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * What an auth listener actually receives from the installed
 * @supabase/supabase-js, with a stubbed fetch and no network. `AuthProvider`
 * subscribes in an effect, after the module-level client has started
 * initializing, so each case records both an early and a late listener.
 */
const STORAGE_KEY = 'measure-auth-token';
const API = 'http://127.0.0.1:54321';

const userRecord = (id: string) => ({
  id,
  aud: 'authenticated',
  role: 'authenticated',
  email: `${id}@example.com`,
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
});

const storedSession = (userId: string, expiresInSeconds: number) => ({
  access_token: 'header.payload.signature',
  refresh_token: `${userId}-refresh-token`,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  user: userRecord(userId),
});

const memoryStorage = (entries: Record<string, string>) => {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
  };
};

const requests: string[] = [];

/** A refresh is refused as a revoked token is; `/user` answers as `oauth-user`. */
const stubFetch = async (input: RequestInfo | URL) => {
  const url = String(input);
  requests.push(url);
  if (url.includes('grant_type=refresh_token')) {
    return new Response(
      JSON.stringify({
        code: 'refresh_token_not_found',
        error: 'invalid_grant',
        error_description: 'Invalid Refresh Token: Refresh Token Not Found',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }
  if (url.endsWith('/auth/v1/user')) {
    return new Response(JSON.stringify(userRecord('oauth-user')), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }
  return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
};

type Auth = ReturnType<typeof createClient>['auth'];

const clients: Auth[] = [];

const makeClient = (stored?: object) => {
  const storage = memoryStorage(stored ? { [STORAGE_KEY]: JSON.stringify(stored) } : {});
  const client = createClient(API, 'anon-key', {
    auth: { storage, storageKey: STORAGE_KEY },
    global: { fetch: stubFetch },
  });
  clients.push(client.auth);
  return { client, storage };
};

const record = (auth: Auth) => {
  const events: Array<[AuthChangeEvent, string | null]> = [];
  const { data } = auth.onAuthStateChange((event, session: Session | null) => {
    events.push([event, session?.user.id ?? null]);
  });
  return { events, unsubscribe: () => data.subscription.unsubscribe() };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

/** The implicit-flow redirect Google sign-in lands on (the app keeps supabase-js's default flow). */
const OAUTH_REDIRECT_HASH =
  '#access_token=header.payload.signature&expires_in=3600&refresh_token=oauth-refresh' +
  '&token_type=bearer&provider_refresh_token=google-refresh';

afterEach(async () => {
  requests.length = 0;
  window.history.replaceState(null, '', '/');
  for (const auth of clients.splice(0)) await auth.stopAutoRefresh();
});

describe('supabase-js: a startup refresh refused with invalid_grant', () => {
  it('a listener subscribed AFTER initialize() gets only INITIAL_SESSION with null, no SIGNED_OUT', async () => {
    const { client, storage } = makeClient(storedSession('previous-user', -3600));
    await client.auth.initialize();

    const late = record(client.auth);
    await settle();
    late.unsubscribe();

    expect(requests).toEqual([`${API}/auth/v1/token?grant_type=refresh_token`]);
    expect(late.events).toEqual([['INITIAL_SESSION', null]]);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('a listener subscribed before the refresh settles gets SIGNED_OUT, then INITIAL_SESSION with null', async () => {
    const { client } = makeClient(storedSession('previous-user', -3600));

    const early = record(client.auth);
    await client.auth.initialize();
    await settle();
    early.unsubscribe();

    expect(early.events).toEqual([
      ['SIGNED_OUT', null],
      ['INITIAL_SESSION', null],
    ]);
  });
});

/** So an event name cannot tell a fresh sign-in from a restored session. */
describe('supabase-js: an OAuth redirect sign-in (implicit flow, session in the URL)', () => {
  it('a listener subscribed before initialize() settles gets INITIAL_SESSION FIRST, then SIGNED_IN', async () => {
    window.history.replaceState(null, '', `/${OAUTH_REDIRECT_HASH}`);
    const { client } = makeClient();

    const early = record(client.auth);
    await client.auth.initialize();
    await settle();
    early.unsubscribe();

    expect(requests).toEqual([`${API}/auth/v1/user`]);
    expect(early.events).toEqual([
      ['INITIAL_SESSION', 'oauth-user'],
      ['SIGNED_IN', 'oauth-user'],
    ]);
  });

  it('a listener subscribed after the deferred SIGNED_IN fired gets only INITIAL_SESSION', async () => {
    window.history.replaceState(null, '', `/${OAUTH_REDIRECT_HASH}`);
    const { client } = makeClient();
    await client.auth.initialize();
    await settle();

    const late = record(client.auth);
    await settle();
    late.unsubscribe();

    expect(late.events).toEqual([['INITIAL_SESSION', 'oauth-user']]);
  });
});

describe('supabase-js: a reload with a valid stored session', () => {
  it('a listener subscribed before initialize() settles gets SIGNED_IN, then INITIAL_SESSION', async () => {
    const { client } = makeClient(storedSession('returning-user', 3600));

    const early = record(client.auth);
    await client.auth.initialize();
    await settle();
    early.unsubscribe();

    expect(requests).toEqual([]);
    expect(early.events).toEqual([
      ['SIGNED_IN', 'returning-user'],
      ['INITIAL_SESSION', 'returning-user'],
    ]);
  });

  it('a listener subscribed after initialize() gets INITIAL_SESSION, then SIGNED_IN again on tab focus', async () => {
    const { client } = makeClient(storedSession('returning-user', 3600));
    await client.auth.initialize();

    const late = record(client.auth);
    await settle();
    window.dispatchEvent(new Event('visibilitychange'));
    await settle();
    late.unsubscribe();

    expect(late.events).toEqual([
      ['INITIAL_SESSION', 'returning-user'],
      ['SIGNED_IN', 'returning-user'],
    ]);
  });
});
