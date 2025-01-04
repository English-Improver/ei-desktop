import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import SentenceAnalyze from "../view/SentenceAnalyze.vue";
import WordsBook from "../view/WordsBook.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: SentenceAnalyze,
  },
  {
    path: "/book",
    component: WordsBook,
  },
  {
    path: "/setting",
    component: () => import("../view/Settings.vue"),
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
