// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

// 暴露 IPC 通信到渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 保留原有的功能
  onTriggerFunction: (callback) => {
    ipcRenderer.on("trigger-vue-function", (event, value) => callback(value));
  },
  
  // 路由相关的功能
  navigateTo: (route) => ipcRenderer.send('navigate', route),
  
  // 添加路由监听
  onRouteChange: (callback) => {
    ipcRenderer.on('route-changed', (event, route) => callback(route));
  },
  
  // 获取当前路由
  getCurrentRoute: () => ipcRenderer.invoke('get-current-route')
});
