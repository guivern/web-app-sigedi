import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Usuario from './components/Usuarios/Usuario.vue'
import ListaRoles from './components/Roles/ListaRoles.vue'

Vue.use(Router);

var router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: {libre: true}
    },
    {
      path: "/usuarios",
      name: "usuarios",
      component: Usuario,
      meta: {libre: true}
    },
    {
      path: "/roles",
      name: "roles",
      component: ListaRoles,
      meta: {libre: true}
    },
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.libre)) {
    next();
  }
});

export default router;
