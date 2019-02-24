import Vue from 'vue'
import store from './store'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './components/Login'
import ListaUsuario from './components/Usuarios/ListaUsuario.vue'
import ListaRoles from './components/Roles/ListaRoles.vue'
import FormUsuario from './components/Usuarios/FormUsuario.vue'

Vue.use(Router);

var router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { libre: true }
    },
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { administrador: true, cajero: true, repartidor: true }
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
          meta: { administrador: true }
        },
        {
          path: "nuevo",
          component: FormUsuario,
          meta: { administrador: true }
        },
        {
          path: ":id",
          component: FormUsuario,
          props: route => ({
            id: parseInt(route.params.id),
          }),
          meta: { administrador: true }
        }
      ]
    },
    {
      path: "/roles",
      name: "roles",
      component: ListaRoles,
      meta: { administrador: true }
    },
  ]
});
// resuelve la navegacion
// verifica si el componente requiere autenticacion o no
//to es el componente objetivo, from es el componente actual
router.beforeEach((to, from, next) => {
  //verificamos si el objetivo es libre
  if (to.matched.some(record => record.meta.libre)) {
    next();
  }
  //sino, requiere autentucacion
  else if(!store.state.usuario) {
    next({
      name: "login"
    });
  }
  //esta autenticado 
  else if (
    to.matched.some(record => record.meta.administrador)
    && store.state.usuario.rol == "Administrador"
  ){ 
      next();
  }
  else if (
    to.matched.some(record => record.meta.repartidor)
    && store.state.usuario.rol == "Repartidor"
  ){ 
      next();
  }  
  else if (
    to.matched.some(record => record.meta.cajero)
    && store.state.usuario.rol == "Cajero"
  ){ 
      next();
  }
  else{}  
});



export default router;
