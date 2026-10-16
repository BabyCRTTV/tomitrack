const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('TomiTrackDesktop',Object.freeze({setAppearance(preference){if(['dark','light','system'].includes(preference))ipcRenderer.send('tomitrack:theme',preference)}}));
