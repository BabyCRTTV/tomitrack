import {readFileSync,mkdirSync,copyFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync('package.json','utf8'));
mkdirSync('artifacts',{recursive:true});
copyFileSync('android/app/build/outputs/apk/release/app-release.apk',`artifacts/TomiTrack-${version}.apk`);
