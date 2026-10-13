import { createClient } from '@supabase/supabase-js';

/**
 * Permanently deletes the *calling* user's account.
 *
 * The account to delete is taken from the verified Supabase session, never
 * from the request body. This endpoint holds the service-role key, so a
 * body-supplied id would let any unauthenticated caller delete any account
 * they could name — and `auth.admin.deleteUser` cascades to the profile,
 * usage logs, AI jobs and payment records.
 *
 * Same shape as `parse-cv-background.mjs` and `improve-cv-background.mjs`:
 * bearer token from the Authorization header, resolved through
 * `supabase.auth.getUser`.
 */
export const handler = async (event) => {
  // CORS & Methods
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    console.warn('[Delete User] Method Not Allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Method Not Allowed',
    };
  }

  // Initialisierung mit dem Service Role Key (Admin-Rechte)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      console.warn('[Delete User] Unauthorized: Missing Authorization header.');
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('[Delete User] Invalid Token:', authError?.message || 'User not found');
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Den User aus der Auth-Tabelle löschen. Die ID stammt ausschließlich aus
    // dem verifizierten Token, niemals aus dem Request-Body.
    // Dies löst durch "ON DELETE CASCADE" auch das Löschen des Profils
    // und der Logs in deiner Datenbank aus.
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Account successfully and permanently deleted.' }),
    };
  } catch (error) {
    console.error('Delete User Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
