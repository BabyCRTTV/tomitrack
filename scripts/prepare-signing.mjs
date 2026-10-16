import {writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
if(process.env.GITHUB_ACTIONS!=='true'||!process.env.GITHUB_ENV||!process.env.RUNNER_TEMP)throw new Error('Signing preparation is restricted to the release runner.');
const encoded=process.env.ANDROID_SIGNING_BUNDLE;
if(!encoded)throw new Error('ANDROID_SIGNING_BUNDLE is missing. Release signing must never fall back to a generated debug key.');
const bundle=JSON.parse(Buffer.from(encoded,'base64').toString('utf8'));
if(!/^[a-zA-Z0-9_-]{1,80}$/.test(bundle.alias||'')||!/^[a-zA-Z0-9_-]{24,128}$/.test(bundle.password||'')||typeof bundle.keystore!=='string')throw new Error('Invalid signing bundle.');
const bytes=Buffer.from(bundle.keystore,'base64');if(bytes.length<1000||bytes.length>30000)throw new Error('Invalid signing keystore size.');
const dir=path.join(process.env.RUNNER_TEMP,'tomitrack-signing');mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,'signing.p12');writeFileSync(file,bytes,{mode:0o600});
// GitHub consumes this control command without displaying its secret value.
process.stdout.write(`::add-mask::${bundle.password}\n`);
appendFileSync(process.env.GITHUB_ENV,`TOMITRACK_SIGNING_STORE_FILE=${file}\nTOMITRACK_SIGNING_PASSWORD=${bundle.password}\nTOMITRACK_SIGNING_ALIAS=${bundle.alias}\n`);
console.log('Prepared the permanent signing identity in the private runner temporary directory.');
