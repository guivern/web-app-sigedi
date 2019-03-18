<template>
  <v-app id="inspire">
    <v-navigation-drawer
      :clipped="$vuetify.breakpoint.lgAndUp"
      v-model="drawer"
      v-if="logueado"
      fixed
      app
    >
      <v-list dense>
        <template>
          <v-list-tile :to="{name: 'home'}">
            <v-list-tile-action>
              <v-icon>home</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Inicio</v-list-tile-title>
          </v-list-tile>
        </template>
        <template v-if="esAdministrador">
          <v-list-group prepend-icon="settings">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Administración</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/articulos'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Artículos</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/categorias'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Categorías</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/vendedores'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Vendedores</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/proveedores'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Proveedores</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
        </template>
        <template v-if="esAdministrador">
          <v-list-group prepend-icon="supervisor_account">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Accesos</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/usuarios'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Usuarios</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{name: 'roles'}">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Perfiles</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
        </template>
        <template v-if="esAdministrador || esRepartidor">
          <v-list-group prepend-icon="assignment">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Inventario</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/ingresos'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Ingresos</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/stock'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Stock</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/distribuciones'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Distribuciones</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
        </template>
        <template v-if="esAdministrador || esCajero">
          <v-list-group prepend-icon="bar_chart">
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Ventas</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/rendiciones'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Rendiciones</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/deudas'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Deudas</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/reportes'">
              <v-list-tile-action>
                <v-icon></v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Reportes</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="primary" dark app fixed>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3" >
        <v-toolbar-side-icon v-show="logueado" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">Sigedi</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="logueado" icon title="Salir">
        <v-icon @click="salir">logout</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-slide-y-transition mode="out-in">
          <router-view></router-view>
        </v-slide-y-transition>
      </v-container>
    </v-content>
  </v-app>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      drawer: null
    };
  },
  computed: {
    logueado() {
      return this.$store.state.usuario;
    },
    esAdministrador() {
      return (
        this.$store.state.usuario &&
        this.$store.state.usuario.rol == "Administrador"
      );
    },
    esCajero() {
      return (
        this.$store.state.usuario &&
        this.$store.state.usuario.rol == "Cajero"
      );
    },
    esRepartidor() {
      return (
        this.$store.state.usuario &&
        this.$store.state.usuario.rol == "Repartidor"
      );
    },
  },
  created() {
    this.$store.dispatch("autoLogin");
  },
  methods: {
    salir() {
      this.$store.dispatch("salir");
    }
  }
};
</script>