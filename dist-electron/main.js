import { app as n, BrowserWindow as i } from "electron";
import { fileURLToPath as l } from "node:url";
import o from "node:path";
const t = o.dirname(l(import.meta.url));
process.env.APP_ROOT = o.join(t, "..");
const s = process.env.VITE_DEV_SERVER_URL, m = o.join(process.env.APP_ROOT, "dist-electron"), r = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? o.join(process.env.APP_ROOT, "public") : r;
let e;
const p = process.env.NODE_ENV === "development";
function c() {
  e = new i({
    icon: o.join(process.env.VITE_PUBLIC, "icon.icns"),
    webPreferences: {
      preload: o.join(t, "preload.mjs")
    }
  }), p && e.webContents.openDevTools(), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), s ? e.loadURL(s) : e.loadFile(o.join(r, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  i.getAllWindows().length === 0 && c();
});
n.whenReady().then(c);
export {
  m as MAIN_DIST,
  r as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
