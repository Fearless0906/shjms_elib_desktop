import { app, BrowserWindow, globalShortcut, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  globalShortcut.register("F12", () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    if (focusedWindow.webContents.isDevToolsOpened()) {
      focusedWindow.webContents.closeDevTools();
    } else {
      focusedWindow.webContents.openDevTools({ mode: "detach" });
    }
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...(details.responseHeaders ?? {}),
        "Content-Security-Policy": [
          "default-src 'self';" +
            "script-src 'self' 'unsafe-inline';" +
            "style-src 'self' 'unsafe-inline';" +
            "connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* http://192.168.0.145:* http://192.168.2.175:* http://countmein.pythonanywhere.com https://api.github.com https://raw.githubusercontent.com;" +
            "img-src 'self' data: https: blob: http://192.168.0.145:8000 http://192.168.0.145:* http://192.168.0.145:8000; http://192.168.2.175:* http://192.168.2.175:8000; http://countmein.pythonanywhere.com:* http://countmein.pythonanywhere.com:8000;" +
            "worker-src 'self' blob:;" +
            "frame-src 'self';" +
            "font-src 'self' data:;" +
            "media-src 'self';" +
            "object-src 'none'",
        ],
      },
    });
  });

  createWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
