const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

// 日志函数
const logPath = path.join(app.getPath("userData"), "app.log");
function logToFile(...args) {
  const message = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
    .join(" ");
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${message}\n`);
  console.log(...args);
}

let mainWindow = null;
const PORT = 2999;

const setupServer = () => {
  const server = express();
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  server.post("/api/trigger", (req, res) => {
    const params = req.body;
    console.log("Received parameters:", params);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("trigger-vue-function", params);
      res.json({ status: "success" });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Window not available" });
    }
  });

  server.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  });

  return server;
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  const isDev = process.env.NODE_ENV === "development";
  const devServerURL =
    typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== "undefined"
      ? MAIN_WINDOW_VITE_DEV_SERVER_URL
      : "http://localhost:5173";

  if (isDev) {
    logToFile("Development mode: Loading Vite Dev Server", devServerURL);
    mainWindow.loadURL(devServerURL);
  } else {
    const indexPath = path.join(__dirname, "../renderer/index.html");
    logToFile("Production mode: Loading built file", indexPath);

    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      logToFile("Error: index.html not found at", indexPath);
    }
  }

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("did-finish-load", () => {
    logToFile("Window loaded successfully");
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      logToFile("Failed to load:", errorCode, errorDescription);
    },
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  const server = setupServer();
  server
    .listen(PORT, () => {
      logToFile(`Server running on port ${PORT}`);
    })
    .on("error", (error) => {
      logToFile("Server failed to start:", error);
    });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

process.on("uncaughtException", (error) => {
  logToFile("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  logToFile("Unhandled Rejection at:", promise, "reason:", reason);
});
