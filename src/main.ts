import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import messages from "./lang/index.js";

import { createI18n } from "vue-i18n";

const i18n = createI18n({
  locale: "en", // 设置默认语言
  messages,
});

createApp(App)
  .use(i18n)
  .mount("#app")
  .$nextTick(() => {
    // Use contextBridge
    window.ipcRenderer.on("main-process-message", (_event, message) => {
      console.log(message);
    });
  });
