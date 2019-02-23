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
          <v-list-group>
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>Accesos</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="'/usuarios'">
              <v-list-tile-action>
                <v-icon>supervisor_account</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Usuarios</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="{name: 'roles'}">
              <v-list-tile-action>
                <v-icon>security</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Perfiles</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue darken-3" dark app fixed>
      <v-toolbar-title style="width: 300px" class="ml-0 pl-3" >
        <v-toolbar-side-icon v-show="logueado" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <span class="hidden-sm-and-down">Sistema</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="logueado" icon>
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