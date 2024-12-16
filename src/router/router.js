import { createRouter, createWebHashHistory } from "vue-router";
import SentenceAnalyze from "../view/SentenceAnalyze.vue";
import WordsBook from "../view/WordsBook.vue";

const routes = [
  {
    path: "/",
    component: SentenceAnalyze,
  },
  {
    path: "/book",
    component: WordsBook,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
