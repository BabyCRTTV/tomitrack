export function validAuthConfig(config) {
  try {
    const url = new URL(config.url);
    if (!config.enabled || url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.username || url.password || url.port || !['','/'].includes(url.pathname) || url.search || url.hash) return false;
    const key = String(config.publicKey || '');
    if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
    const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    return payload.role === 'anon' && key.split('.').length === 3;
  } catch { return false; }
}
export function passwordError(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) return 'Use a password between 12 and 128 characters.';
  return '';
}
export function collectionKey(userId) {
  if (!userId) return 'collection';
  if (!/^[a-z0-9-]{1,80}$/i.test(userId)) throw new Error('Invalid account identity.');
  return `collection:user:${userId}`;
}
export function createAccounts(config, factory) {
  const configured = validAuthConfig(config);
  const client = configured ? factory(config.url, config.publicKey, {
    auth: {persistSession:false, autoRefreshToken:true, detectSessionInUrl:false, flowType:'pkce'},
    global: {headers:{'X-Client-Info':'tomitrack/0.2.0'}}
  }) : null;
  let recovery = false;
  const requireClient = () => { if (!client) throw new Error('Accounts are not active yet. You can keep using your device collection.'); return client; };
  const checked = result => { if (result.error) throw result.error; return result.data; };
  return {
    configured,
    subscribe(callback) { return client?.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>callback(session?.user?.email_confirmed_at ? session.user : null),0);}).data.subscription; },
    async signIn(email,password) {
      recovery=false;
      const data=checked(await requireClient().auth.signInWithPassword({email,password}));
      if (!data.user?.email_confirmed_at) { await client.auth.signOut({scope:'local'}); throw new Error('Verify your email before signing in.'); }
      return data.user;
    },
    async signUp(email,password,name) {
      recovery=false;
      const error=passwordError(password); if(error) throw new Error(error);
      const data=checked(await requireClient().auth.signUp({email,password,options:{data:{display_name:String(name||'').trim().slice(0,60)}}}));
      // Registration must require email confirmation at the provider as well.
      if(data.session) await client.auth.signOut({scope:'local'});
      return data.user;
    },
    async verify(email,token,type='signup') {
      if(!['signup','recovery'].includes(type) || !/^\d{6,10}$/.test(token)) throw new Error('Enter the code from your email.');
      const data=checked(await requireClient().auth.verifyOtp({email,token,type}));
      recovery=type==='recovery'; return data.user;
    },
    async reset(email) { checked(await requireClient().auth.resetPasswordForEmail(email)); },
    async resend(email) { checked(await requireClient().auth.resend({type:'signup',email})); },
    async updatePassword(password,currentPassword) {
      const error=passwordError(password);if(error)throw new Error(error);
      if(!recovery&&!currentPassword)throw new Error('Enter your current password first.');
      checked(await requireClient().auth.updateUser({password,...(!recovery?{current_password:currentPassword}:{})}));recovery=false;
    },
    async signOut() { checked(await requireClient().auth.signOut({scope:'local'}));recovery=false; },
    async uploadBackup(userId,backup) {
      const c=requireClient();const {user}=checked(await c.auth.getUser());
      if(user?.id!==userId)throw new Error('Sign in again before backing up.');
      if(new TextEncoder().encode(JSON.stringify(backup)).length>10000000)throw new Error('Cloud backups support up to 10 MB. Use a file backup for larger collections.');
      checked(await c.from('collection_backups').upsert({user_id:userId,payload:backup},{onConflict:'user_id'}));
    },
    async downloadBackup(userId) {
      const c=requireClient();const {user}=checked(await c.auth.getUser());
      if(user?.id!==userId)throw new Error('Sign in again before restoring.');
      return checked(await c.from('collection_backups').select('payload,updated_at').eq('user_id',userId).maybeSingle());
    }
  };
}
