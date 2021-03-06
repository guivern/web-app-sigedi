import Vue from "vue";
import store from "./store";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./components/Login";
import ListaUsuario from "./components/Usuarios/ListaUsuario.vue";
import ListaRoles from "./components/Usuarios/ListaRoles.vue";
import FormUsuario from "./components/Usuarios/FormUsuario.vue";
import ListaVendedores from "./components/Vendedores/ListaVendedores.vue";
import FormVendedores from "./components/Vendedores/FormVendedores.vue";
import ListaCategorias from "./components/Articulos/ListaCategorias.vue";
import FormCategoria from "./components/Articulos/FormCategoria.vue";
import ListaProveedores from "./components/Proveedores/ListaProveedores.vue";
import FormProveedores from "./components/Proveedores/FormProveedores.vue";
import ListaArticulos from "./components/Articulos/ListaArticulos.vue";
import FormArticulos from "./components/Articulos/FormArticulos.vue";
import ListaIngresos from "./components/Ingresos/ListaIngresos.vue";
import FormIngresos from "./components/Ingresos/FormIngresos.vue";
import ListaEdiciones from "./components/Articulos/ListaEdiciones.vue";
import ListaEgresos from "./components/Articulos/ListaEgresos.vue";
import ListaDistribuciones from "./components/Distribuciones/ListaDistribuciones.vue";
import FormDistribuciones from "./components/Distribuciones/FormDistribuciones.vue";
import ListaRendicionesByCaja from "./components/Rendiciones/ListaRendicionesByCaja";
import FormRendiciones from "./components/Rendiciones/FormRendiciones.vue";
import ListaDeudas from "./components/Deudas/ListaDeudas.vue";
import FormDeudas from "./components/Deudas/FormDeudas.vue";
import ListaRendicionesGeneral from "./components/Rendiciones/ListaRendicionesGeneral";
import ReporteForm from "./components/Reportes/ReporteForm";

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
      meta: { administrador: true, cajero: true, repartidor: true },
      redirect: to => {
        if(store.state.usuario){ // páginas home segun rol
          switch (store.state.usuario.rol) {
            case 'Administrador':
              return 'caja/rendiciones';
            case 'Repartidor':
              return 'distribuciones';
            case 'Cajero':
              return 'caja/rendiciones';
          }
        }
      }
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
            id: parseInt(route.params.id)
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
    {
      path: "/vendedores",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaVendedores,
          meta: { administrador: true }
        },
        {
          path: "nuevo",
          component: FormVendedores,
          meta: { administrador: true }
        },
        {
          path: ":id",
          component: FormVendedores,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true }
        }
      ]
    },
    {
      path: "/categorias",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaCategorias,
          meta: { administrador: true }
        },
        {
          path: "nuevo",
          component: FormCategoria,
          meta: { administrador: true }
        },
        {
          path: ":id",
          component: FormCategoria,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true }
        }
      ]
    },
    {
      path: "/proveedores",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaProveedores,
          meta: { administrador: true }
        },
        {
          path: "nuevo",
          component: FormProveedores,
          meta: { administrador: true }
        },
        {
          path: ":id",
          component: FormProveedores,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true }
        }
      ]
    },
    {
      path: "/articulos",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaArticulos,
          meta: { administrador: true }
        },
        {
          path: "nuevo",
          component: FormArticulos,
          meta: { administrador: true }
        },
        {
          path: ":id",
          component: FormArticulos,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true }
        }
      ]
    },
    {
      path: "/ingresos",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaIngresos,
          meta: { administrador: true, repartidor: true }
        },
        {
          path: "nuevo",
          component: FormIngresos,
          meta: { administrador: true, repartidor: true }
        },
        {
          path: ":id",
          component: FormIngresos,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true, repartidor: true }
        }
      ]
    },
    {
      path: "/ediciones",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaEdiciones,
          meta: { administrador: true, repartidor: true }
        },
      ]
    },
    {
      path: "/distribuciones",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaDistribuciones,
          meta: { administrador: true, repartidor: true }
        },
        {
          path: "nuevo",
          component: FormDistribuciones,
          meta: { administrador: true, repartidor: true }
        },
        {
          path: ":id",
          component: FormDistribuciones,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true, repartidor: true }
        }
      ]
    },
    {
      path: "/egresos",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaEgresos,
          meta: { administrador: true, repartidor: true }
        },
      ]
    },
    {
      path: "/caja/rendiciones",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaRendicionesByCaja,
          meta: { administrador: true, cajero: true }
        },
        {
          path: "nuevo",
          name: "nueva-rendicion",
          component: FormRendiciones,
          props: true,
          meta: { administrador: true, cajero: true }
        },
        {
          path: ":id",
          component: FormRendiciones,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true, cajero: true }
        }
      ]
    },
    {
      path: "/deudas",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaDeudas,
          meta: { administrador: true, cajero: true }
        },
        {
          path: "detalle/:id",
          component: FormDeudas,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true, cajero: true }
        },
      ]
    },
    {
      path: "/rendiciones",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ListaRendicionesGeneral,
          meta: { administrador: true, cajero: true }
        },
        {
          path: ":id",
          component: FormRendiciones,
          props: route => ({
            id: parseInt(route.params.id)
          }),
          meta: { administrador: true, cajero: true }
        }
        
      ]
    },
    {
      path: "/reportes",
      component: {
        render(c) {
          return c("router-view");
        }
      },
      children: [
        {
          path: "",
          component: ReporteForm,
          meta: { administrador: true, cajero: true }
        },
      ]
    },
  ]
});
// resuelve la navegacion
// verifica si el componente requiere autenticacion o no
//to es el componente objetivo, from es el componente actual
router.beforeEach((to, from, next) => {
  if (!to.meta.libre) {
    const authUser = window.localStorage.getItem("sigediToken");
    if (!authUser) {
      // no esta autenticado
      next({ name: "login" });
    } else {
      if (
        to.matched.some(record => record.meta.administrador) &&
        store.state.usuario.rol == "Administrador"
      ) {
        next();
      } else if (
        to.matched.some(record => record.meta.repartidor) &&
        store.state.usuario.rol == "Repartidor"
      ) {
        next();
      } else if (
        to.matched.some(record => record.meta.cajero) &&
        store.state.usuario.rol == "Cajero"
      ) {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
