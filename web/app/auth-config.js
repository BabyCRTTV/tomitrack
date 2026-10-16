// Public client configuration only. Never put a service-role key, DB password or SMTP secret here.
// Remains disabled until the Supabase project, email delivery and database policies are verified.
export const AUTH_CONFIG = Object.freeze({ enabled: false, url: '', publicKey: '' });
