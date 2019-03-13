<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Ingresos</v-toolbar-title>
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
          :items="ingresos"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :disable-initial-sort="true"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon @click="$router.push({path: '/ingresos/' + props.item.id, append: true})">edit</v-icon>
              <template v-if="props.item.activo">
                <v-icon
                  color="info"
                  @click="mostrarDialogActivarDesactivar(props.item)"
                >toggle_off</v-icon>
              </template>
              <template v-else>
                <v-icon @click="mostrarDialogActivarDesactivar(props.item)">toggle_on</v-icon>
              </template>
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.fechaCreacion }}</td>
            <td>{{ props.item.nombreProveedor }}</td>
            <td>{{ props.item.numeroComprobante }}</td>
            <td>{{ props.item.usuarioCreador }}</td>
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
              <v-btn color="info" title="recargar" @click="listar()">Reintentar
                <v-icon small>refresh</v-icon>
              </v-btn>
            </div>
            <div v-else class="text-xs-center">No se encontraron registros</div>
          </template>
        </v-data-table>
      </v-card>

      <!----------------- DIALOG ACTIVAR/DESACTIVAR ----------------->
      <v-dialog v-model="activarDesactivarDialog.mostrar" max-width="420">
        <v-card>
          <v-toolbar color="secondary" flat dark dense extense>
            <v-toolbar-title>
              {{activarDesactivarDialog.titulo}}
              <v-icon class="mx-2" color="warning">warning</v-icon>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>{{activarDesactivarDialog.mensaje}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="error" @click="cerrarDialogActivarDesactivar()">Cancelar</v-btn>
            <v-btn flat color="info" @click="activarDesactivar()">Confirmar</v-btn>
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
      color="success"
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
import usuarioMixin from '../../mixins/usuarioMixin.js'
export default {
  mixins:[usuarioMixin],
  data() {
    return {
      ingresos: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Nro. Ingreso", value: "id" },
        { text: "Fecha", value: "fechaCreacion"},
        { text: "Proveedor", value: "nombreProveedor"},
        { text: "Nro. Comprobante", value: "numeroComprobante"},
        { text: "Usuario", value: "nombreUsuario"}
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
        .get(`${process.env.VUE_APP_ROOT_API}ingresos?Inactivos=true`)
        .then(response => {
          this.ingresos = response.data;
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
        this.activarDesactivarDialog.titulo = "Anular ingreso";
        this.activarDesactivarDialog.mensaje =
          "Desea anular el ingreso? ";
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
          `${process.env.VUE_APP_ROOT_API}ingresos/${
            this.activarDesactivarDialog.item.activo ? "desactivar" : "activar"
          }/${this.activarDesactivarDialog.item.id}`
        )
        .then(() => {
          this.ingresos.map(u => {
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