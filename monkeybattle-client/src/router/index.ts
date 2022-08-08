import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Leaderboard from "../views/Leaderboard.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/leaderboard",
    name: "Leaderboard",
    component: Leaderboard,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () =>
      import(/* webpackChunkName: "dashboard" */ "../views/Dashboard.vue"),
  },
  {
    path: "/newdeck",
    name: "NewDeck",
    component: () =>
      import(/* webpackChunkName: "newDeck" */ "../views/NewDeck.vue"),
  },
  {
    path: "/deckbuilder/:deckId",
    name: "DeckBuilder",
    component: () =>
      import(
        /* webpackChunkName: "deckBuilder" */ "../components/DeckBuilder.vue"
      ),
    props: (route) => ({
      deckId: parseInt(route.params.deckId as string),
    }),
  },
  {
    path: "/play",
    name: "GameView",
    component: () =>
      import(/* webpackChunkName: "game" */ "../views/GameView.vue"),
    props: (route) => ({
      ai: route.query.ai ? true : false,
      deckId: parseInt(route.query.deckId as string),
    }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
