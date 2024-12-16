import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import router from "./router/router.js";

console.log("Creating Vue app...");
const app = createApp(App);

console.log("Registering Element Plus icons...");
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

console.log("Installing plugins...");
app.use(ElementPlus);
app.use(router);

console.log("Mounting app...");
app.mount("#app");
