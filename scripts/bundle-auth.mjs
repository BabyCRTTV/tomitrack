import {build} from 'esbuild';
await build({stdin:{contents:"export { createClient } from '@supabase/supabase-js';",resolveDir:process.cwd(),sourcefile:'supabase-entry.js'},bundle:true,format:'esm',platform:'browser',target:'es2020',minify:true,legalComments:'eof',outfile:'web/app/vendor/supabase.js'});
console.log('Bundled official Supabase client for offline app delivery.');
