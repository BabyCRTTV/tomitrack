const STATUSES=new Set(['idle','checking','current','available','downloading','ready','permission','installing','error']);
export function normaliseUpdateState(value={}){
  const version=v=>typeof v==='string'&&/^\d{1,5}\.\d{1,5}\.\d{1,5}$/.test(v)?v:'';
  return {status:STATUSES.has(value.status)?value.status:'idle',message:String(value.message||'').slice(0,500),progress:Math.max(0,Math.min(100,Math.round(Number(value.progress)||0))),installedVersion:version(value.installedVersion),latestVersion:version(value.latestVersion),available:value.available===true,downloaded:value.downloaded===true,autoCheck:value.autoCheck!==false};
}
export function createUpdateController({native=globalThis.window?.TomiTrackNative,onChange=()=>{},target=globalThis.window}={}){
  const supported=typeof native?.getUpdateState==='function'&&typeof native?.checkForUpdates==='function';
  let state=normaliseUpdateState();
  if(supported)try{state=normaliseUpdateState(JSON.parse(native.getUpdateState()))}catch{}
  target?.addEventListener?.('tomitrack:update',event=>{if(!supported)return;state=normaliseUpdateState(event.detail);onChange(state)});
  return {supported,get state(){return state},get busy(){return ['checking','downloading'].includes(state.status)},check(){if(supported)native.checkForUpdates()},install(){if(!supported||!state.available)return;if(state.downloaded)native.resumeUpdateInstall();else native.downloadAndInstallUpdate()},setAutoCheck(enabled){if(supported){native.setUpdateChecks(Boolean(enabled));state={...state,autoCheck:Boolean(enabled)};onChange(state)}}};
}
