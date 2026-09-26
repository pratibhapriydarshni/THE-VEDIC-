import { createClient } from '@supabase/supabase-js';
import { adminDb } from './supabase';

export type AdminRole = 'super_admin' | 'staff_admin';

export async function bearerUser(req: Request) {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';

  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_PUBLIC_ENV_MISSING');
  }

  const db = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
  } = await db.auth.getUser(token);

  return user || null;
}

export async function requireAdmin(
  req: Request,
  superOnly = false
) {
  const user = await bearerUser(req);

  if (!user) {
    throw new Error('AUTH_REQUIRED');
  }

  const { data: profile, error } = await adminDb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const role = profile?.role as AdminRole | undefined;

  if (!role || (superOnly && role !== 'super_admin')) {
    throw new Error('FORBIDDEN');
  }

  return { user, role };
}

export function apiError(e: unknown) {
  const message =
    e instanceof Error ? e.message : 'SERVER_ERROR';

  const status =
    message === 'AUTH_REQUIRED'
      ? 401
      : message === 'FORBIDDEN'
        ? 403
        : message === 'NOT_FOUND'
          ? 404
          : 400;

  return Response.json(
    { error: message },
    { status }
  );
}