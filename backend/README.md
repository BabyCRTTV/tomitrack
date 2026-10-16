# Account activation

The client integration is implemented; `web/app/auth-config.js` stays disabled until a real project and its configuration are verified. No account is simulated in local storage.

1. Connect the Supabase plugin and select/create a TomiTrack project. Do not reuse an unrelated project's user database without the owner's decision.
2. Apply `001_accounts.sql`. Verify two separate authenticated users cannot read/update each other's backups and anonymous requests have no table privileges. Check Supabase security advisors.
3. Enable email/password authentication, require email confirmation, set a minimum password length of 12, require the current password for normal password changes, configure production SMTP, and apply signup/reset rate limits. Add CAPTCHA before a broad public launch and wire a configured CAPTCHA provider into signup/reset first; it is not implemented in 0.2.0.
4. Change the Confirm signup and Reset password email templates to include the OTP `{{ .Token }}`. The app has separate signup and recovery code verification screens. Set the Site URL to `https://babycrttv.github.io/tomitrack/app/`. No credentials travel through custom redirects or URL fragments.
5. Populate AUTH_CONFIG with only the HTTPS project URL and public publishable key. Never include service-role keys, database passwords or SMTP credentials. Set `enabled:true` only after verification. Run `npm run prepare:android` to regenerate the exact network host allowlist for Android. The project uses default `*.supabase.co` domains.
6. Test registration and its email code, sign-in, generic password-reset messaging, recovery code, password change, logout and account switching on web, Android and Windows. Verify cloud backup ownership with two users before enabling it for the public.

## Security and behavior

Official Supabase JS client, locally bundled and version pinned. Passwords are sent over TLS directly to Supabase Auth and never written by TomiTrack to files, browser storage, analytics or collection backups. Sessions are memory-only (`persistSession:false`, URL-session detection disabled); users sign in again after closing/restarting. UI code clears password fields after each submit. No admin key is shipped.

Collections are separated by authenticated user ID in IndexedDB. Existing 0.1.0 guest data remains at its original key. Signing in never automatically claims/uploads a guest collection. A user can explicitly copy their guest collection to their account on the same trusted device. Local data is not encrypted at rest; use OS device access controls. Sign-out clears the signed-in collection's local cache, leaving the guest collection intact. Unsaved cloud changes should be exported before sign-out.

Cloud backup is explicit upload/restore, includes photos, has a 10 MB client cap and database limit, and is protected by owner-only RLS. It is not automatic live synchronization. Users confirm before replacing local or cloud data. The service worker caches only app assets, not Supabase API responses or account data.
