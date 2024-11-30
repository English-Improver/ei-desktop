// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

// 暴露 IPC 通信到渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  onTriggerFunction: (callback) => {
    ipcRenderer.on("trigger-vue-function", (event, value) => callback(value));
  },
});
