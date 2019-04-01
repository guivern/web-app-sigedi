<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Distribuciones</v-toolbar-title>
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
          :items="distribuciones"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :disable-initial-sort="true"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-icon
                class="icon mx-1"
                title="ver detalle"
                @click="$router.push({path: '/distribuciones/' + props.item.id, append: true})"
              >visibility</v-icon>
              <template v-if="props.item.anulable">
                <v-icon
                  @click="mostrarDialog(props.item)"
                  title="anular"
                >block</v-icon>
              </template>
              <template v-else-if="props.item.anulado">
                
                <span>ANULADO</span>
              </template>
            </td>
            <td>{{ props.item.id }}</td>
            <td>{{ columnDate(props.item.fechaCreacion) }}</td>
            <td>{{ props.item.nombreVendedor }}</td>
            <td>{{ props.item.nombreUsuarioCreador }}</td>
            
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
      <v-dialog v-model="alertDialog.mostrar" max-width="420">
        <v-card>
          <v-toolbar color="secondary" flat dark dense extense>
            <v-toolbar-title>
              {{alertDialog.titulo}}
              <v-icon class="mx-2" color="warning">warning</v-icon>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>{{alertDialog.mensaje}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="error" @click="cerrarDialog()">Cancelar</v-btn>
            <v-btn flat color="info" @click="anular()">Confirmar</v-btn>
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
import usuarioMixin from "../../mixins/columnasMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      distribuciones: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false, },
        { text: "Nro. Distribución", value: "id"  },
        { text: "Fecha Distribución", value: "fechaCreacion"   },
        { text: "Vendedor", value: "nombreVendedor"  },
        { text: "Distribuidor", value: "nombreUsuario" },
        
      ],
      alertDialog: {
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
        .get(`${process.env.VUE_APP_ROOT_API}distribuciones?Inactivos=true`)
        .then(response => {
          this.distribuciones = response.data;
          this.cargando = false;
          this.getError = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    mostrarDialog(item) {
      if (item.activo) {
        this.alertDialog.titulo = "Anular distribución";
        this.alertDialog.mensaje =
          "Está seguro que desea anular la distribución nro. " + item.id + " ?";
      }
      this.alertDialog.item = item;
      this.alertDialog.mostrar = true;
    },
    cerrarDialog() {
      this.alertDialog.mostrar = false;
    },
    anular() {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}distribuciones/${
            this.alertDialog.item.activo ? "desactivar" : "activar"
          }/${this.alertDialog.item.id}`
        )
        .then(() => {
          this.cerrarDialog();
          this.listar();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
          this.cerrarDialog();
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
.icon:hover {
  color: #1976d2;
}
.icon {
  color: grey;
}
</style>