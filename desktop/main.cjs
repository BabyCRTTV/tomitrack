const {app,BrowserWindow,shell,session}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const allowedExternal=url=>{try{return ['https:'].includes(new URL(url).protocol)}catch{return false}};
app.setAppUserModelId('com.tomiking.tomitrack');
function createWindow(){
  const window=new BrowserWindow({width:1180,height:840,minWidth:380,minHeight:580,title:'TomiTrack',backgroundColor:'#f8f7f3',icon:path.join(__dirname,'../web/assets/icon.png'),autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  const root=pathToFileURL(path.join(__dirname,'../web/')).href;
  window.webContents.setWindowOpenHandler(({url})=>{if(allowedExternal(url))shell.openExternal(url);return {action:'deny'}});
  window.webContents.on('will-navigate',(event,url)=>{if(!url.startsWith(root)){event.preventDefault();if(allowedExternal(url))shell.openExternal(url)}});
  window.loadFile(path.join(__dirname,'../web/app/index.html'));
}
app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));createWindow();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
