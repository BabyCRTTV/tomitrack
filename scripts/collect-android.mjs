import {readFileSync,mkdirSync,copyFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync('package.json','utf8'));
mkdirSync('artifacts',{recursive:true});
copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk',`artifacts/TomiTrack-${version}-early-access.apk`);
