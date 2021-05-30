import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/zero-sum",
    name: "Zero-sum",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/zero-sum.vue"),
  },
  {
    path: "/bimatrix",
    name: "Bimatrix",
    component: () =>
      import("../views/bimatrix.vue"),
  },
  {
    path: "/position",
    name: "Position",
    component: () =>
      import("../views/position.vue"),
  },
];

const router = new VueRouter({
  mode: "abstract",
  routes,
});

export default router;
