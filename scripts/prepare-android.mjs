import {cpSync,mkdirSync,rmSync} from 'node:fs';
const dest='android/app/src/main/assets/web';rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});cpSync('web',dest,{recursive:true});mkdirSync('android/app/src/main/res/drawable',{recursive:true});cpSync('web/assets/icon.png','android/app/src/main/res/drawable/icon.png');
console.log('Bundled shared TomiTrack app for Android.');
