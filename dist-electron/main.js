import { app, BrowserWindow, globalShortcut, session } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
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
        ...details.responseHeaders ?? {},
        "Content-Security-Policy": [
          "default-src 'self';script-src 'self' 'unsafe-inline';style-src 'self' 'unsafe-inline';connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* http://192.168.0.145:* http://192.168.2.175:* http://countmein.pythonanywhere.com https://api.github.com https://raw.githubusercontent.com;img-src 'self' data: https: blob: http://192.168.0.145:8000 http://192.168.0.145:* http://192.168.0.145:8000; http://192.168.2.175:* http://192.168.2.175:8000; http://countmein.pythonanywhere.com:* http://countmein.pythonanywhere.com:8000;worker-src 'self' blob:;frame-src 'self';font-src 'self' data:;media-src 'self';object-src 'none'"
        ]
      }
    });
  });
  createWindow();
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
