import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onTriggerFunction: (callback: (params: any) => void) => {
    ipcRenderer.on('trigger-function', (_event, params) => callback(params));
  }
})
