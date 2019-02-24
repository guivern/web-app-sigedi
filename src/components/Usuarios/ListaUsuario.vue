<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="primary" dark>
        <v-toolbar-title class="headline font-weight-regular">Usuarios</v-toolbar-title>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field
          color="#B2EBF2"
          class="text-xs-center"
          v-model="search"
          append-icon="search"
          label="Búsqueda"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
      </v-toolbar>

      <!-------------------------- LISTA ---------------------------->
      <v-data-table
        :headers="headers"
        :items="usuarios"
        class="elevation-1"
        :search="search"
        :loading="cargando"
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-icon @click="$router.push({path: '/usuarios/' + props.item.id, append: true})">edit</v-icon>
            <template v-if="props.item.activo">
              <v-icon color="primary" @click="mostrarDialogActivarDesactivar(props.item)">toggle_off</v-icon>
            </template>
            <template v-else>
              <v-icon @click="mostrarDialogActivarDesactivar(props.item)">toggle_on</v-icon>
            </template>
          </td>
          <td>{{ props.item.username }}</td>
          <td>{{ props.item.nombreRol }}</td>
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.apellido }}</td>
          <td
            :class="{'indigo--text':props.item.activo, 'blue-grey--text':!props.item.activo}"
          >{{ props.item.activo ? 'Activo' : 'Inactivo' }}</td>
        </template>

        <template slot="no-data">
          <div v-if="cargando" class="text-xs-center">
            <p>Cargando...</p>
          </div>
          <div v-else-if="getError" class="text-xs-center">
            <v-alert
              outline
              :value="getError"
              transition="scale-transition"
              type="error"
            >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
            <v-btn color="primary" title="recargar" @click="listar()">Reintentar
              <v-icon small>refresh</v-icon>
            </v-btn>
          </div>
          <div v-else class="text-xs-center">No se encontraron registros</div>
        </template>
      </v-data-table>

      <!----------------- DIALOG ACTIVAR/DESACTIVAR ----------------->
      <v-dialog v-model="activarDesactivarDialog.mostrar" max-width="420">
        <v-card>
          <v-toolbar color="secondary" flat dark dense extense>
            <v-toolbar-title>
              {{activarDesactivarDialog.titulo}}
              <v-icon class="mx-2" color="error">warning</v-icon>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>{{activarDesactivarDialog.mensaje}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="error" @click="cerrarDialogActivarDesactivar()">Cancelar</v-btn>
            <v-btn flat color="primary" @click="activarDesactivar()">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
    <v-btn
      v-if="!getError"
      fixed
      dark
      fab
      bottom
      right
      type="button"
      title="Nuevo"
      color="primary"
      @click="$router.push({path: 'nuevo', append: true})"
    >
      <v-icon>add</v-icon>
    </v-btn>
    <v-snackbar
      :timeout="1500"
      bottom
      left
      v-model="snackbar.visible"
      :color="snackbar.color"
    >{{snackbar.message}}</v-snackbar>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      usuarios: [],
      roles: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      matchError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Username", value: "username" },
        { text: "Perfil", value: "rol" },
        { text: "Nombre", value: "nombre" },
        { text: "Apellido", value: "apellido" },
        { text: "Estado", value: "activo" }
      ],
      activarDesactivarDialog: {
        titulo: "",
        mensaje: "",
        id: null,
        mostrar: false,
        item: {}
      },
      search: "",
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      }
    };
  },
  methods: {
    listar() {
      this.cargando = true;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}usuarios?Inactivos=true`)
        .then(response => {
          this.usuarios = response.data;
          this.cargando = false;
          this.getError = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    mostrarDialogActivarDesactivar(item) {
      if (item.activo) {
        this.activarDesactivarDialog.titulo = "Desactivar usuario";
        this.activarDesactivarDialog.mensaje =
          "El usuario ya no podrá acceder al sistema. Desea dar de baja al usuario " +
          item.username +
          " ?";
      } else {
        this.activarDesactivarDialog.titulo = "Activar usuario";
        this.activarDesactivarDialog.mensaje =
          "El usuario podrá acceder nuevamente al sistema. Desea dar de alta al usuario " +
          item.username +
          " ?";
      }
      this.activarDesactivarDialog.item = item;
      this.activarDesactivarDialog.mostrar = true;
    },
    cerrarDialogActivarDesactivar() {
      this.activarDesactivarDialog.mostrar = false;
    },
    activarDesactivar() {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}usuarios/${
            this.activarDesactivarDialog.item.activo ? "desactivar" : "activar"
          }/${this.activarDesactivarDialog.item.id}`
        )
        .then(() => {
          this.usuarios.map(u => {
            if (u.id == this.activarDesactivarDialog.item.id) {
              u.activo = !u.activo;
            }
          });
          this.cerrarDialogActivarDesactivar();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
          this.cerrarDialogActivarDesactivar();
        });
    }
  },
  computed: {},
  watch: {},
  created() {
    this.listar();
  }
};
</script>
<style scoped>
</style>