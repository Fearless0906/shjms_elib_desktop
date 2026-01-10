import { app as s, BrowserWindow as r, globalShortcut as i, session as d } from "electron";
import { fileURLToPath as h } from "node:url";
import t from "node:path";
const c = t.dirname(h(import.meta.url));
process.env.APP_ROOT = t.join(c, "..");
const n = process.env.VITE_DEV_SERVER_URL, u = t.join(process.env.APP_ROOT, "dist-electron"), l = t.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = n ? t.join(process.env.APP_ROOT, "public") : l;
let e;
function p() {
  e = new r({
    icon: t.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: t.join(c, "preload.mjs")
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n ? e.loadURL(n) : e.loadFile(t.join(l, "index.html"));
}
s.on("window-all-closed", () => {
  process.platform !== "darwin" && (s.quit(), e = null);
});
s.on("activate", () => {
  r.getAllWindows().length === 0 && p();
});
s.whenReady().then(() => {
  i.register("F12", () => {
    const o = r.getFocusedWindow();
    o && (o.webContents.isDevToolsOpened() ? o.webContents.closeDevTools() : o.webContents.openDevTools({ mode: "detach" }));
  }), d.defaultSession.webRequest.onHeadersReceived((o, a) => {
    a({
      responseHeaders: {
        ...o.responseHeaders ?? {},
        "Content-Security-Policy": [
          "default-src 'self';script-src 'self' 'unsafe-inline';style-src 'self' 'unsafe-inline';connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* http://192.168.0.145:* http://192.168.2.175:* http://countmein.pythonanywhere.com https://api.github.com https://raw.githubusercontent.com;img-src 'self' data: https: blob: http://192.168.0.145:8000 http://192.168.0.145:* http://192.168.0.145:8000; http://192.168.2.175:* http://192.168.2.175:8000; http://countmein.pythonanywhere.com:* http://countmein.pythonanywhere.com:8000;worker-src 'self' blob:;frame-src 'self';font-src 'self' data:;media-src 'self';object-src 'none'"
        ]
      }
    });
  }), p();
});
s.on("will-quit", () => {
  i.unregisterAll();
});
export {
  u as MAIN_DIST,
  l as RENDERER_DIST,
  n as VITE_DEV_SERVER_URL
};
