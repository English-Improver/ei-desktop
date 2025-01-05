import {app, BrowserWindow, ipcMain, session, nativeImage} from 'electron';
import {join} from 'path';
import { HttpServer } from './http-server';

let httpServer: HttpServer | null = null;
let mainWindow: BrowserWindow | null = null;

// 确保应用程序只有一个实例在运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，将焦点放在主窗口上
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 注册自定义协议
  if (!app.isDefaultProtocolClient('ei-desktop')) {
    app.setAsDefaultProtocolClient('ei-desktop');
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // 隐藏默认标题栏
    titleBarStyle: 'hiddenInset', // macOS 风格的隐藏标题栏
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
    mainWindow.webContents.openDevTools();
  }
  else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }

  // Initialize HTTP server
  httpServer = new HttpServer(mainWindow, app);

  return mainWindow;
}

app.whenReady().then(() => {
  mainWindow = createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\'']
      }
    })
  })

  // 处理从URL启动的情况
  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (httpServer) {
    httpServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('message', (event, message) => {
  console.log(message);
});