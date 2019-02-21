import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import ListaUsuario from './components/Usuarios/ListaUsuario.vue'
import ListaRoles from './components/Roles/ListaRoles.vue'
import FormUsuario from './components/Usuarios/FormUsuario.vue'

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
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaUsuario,
          meta: { libre: true }
        },
        {
          path: "nuevo",
          component: FormUsuario,
          meta: { libre: true },
        },
        {
          path: ":id",
          component: FormUsuario,
          props: route => ({
            id: parseInt(route.params.id),
          }),
          meta: { libre: true }
        }
      ]
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
