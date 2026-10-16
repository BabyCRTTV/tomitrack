import {AUTH_CONFIG} from '../web/app/auth-config.js';
import {validAuthConfig} from '../web/app/accounts.js';
import {cpSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
const dest='android/app/src/main/assets/web';rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});cpSync('web',dest,{recursive:true});mkdirSync('android/app/src/main/res/drawable',{recursive:true});cpSync('web/assets/icon.png','android/app/src/main/res/drawable/icon.png');
console.log('Bundled shared TomiTrack app for Android.');

const host=validAuthConfig(AUTH_CONFIG)?new URL(AUTH_CONFIG.url).hostname:'';
writeFileSync('android/app/src/main/res/values/auth.xml',`<resources><string name="auth_host">${host}</string></resources>`);
