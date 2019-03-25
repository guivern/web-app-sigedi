<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Ediciones</v-toolbar-title>
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
          :items="ediciones"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :disable-initial-sort="true"
        >
          <template slot="items" slot-scope="props">
            <!--<td>
              <template v-if="props.item.activo">
                <v-icon>check</v-icon>
              </template>
              <template v-else>
                <v-icon
                  @click="showAlert(props.item)"
                  class="icon mx-1"
                >block</v-icon>
              </template>
            </td>-->
            <td class="text-xs-center">
              <template v-if="props.item.activo">
                <v-icon color="info" @click="showAlert(props.item)">toggle_off</v-icon>
              </template>
              <template v-else>
                <v-icon @click="showAlert(props.item)">toggle_on</v-icon>
              </template>
            </td>
            <td>{{ props.item.nombreArticulo }}</td>
            <td class="text-xs-center">{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
            <td class="text-xs-right">{{ props.item.nroEdicion }}</td>
            <td class="text-xs-right">{{ props.item.precioVenta }}</td>
            <td class="text-xs-right">{{ props.item.precioRendicion }}</td>
            <!--<td class="text-xs-right">{{ props.item.cantidadInicial }}</td>-->
            <td class="text-xs-right">{{ props.item.cantidadActual }}</td>
            <!--<td class="text-xs-center">
              <v-icon>{{props.item.activo?'check':'block'}}</v-icon>
            </td>-->
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
              <v-btn color="info" title="recargar" @click="listar()">
                Reintentar
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
              <v-icon class="mx-2" :color="alertDialog.icono">{{alertDialog.icono}}</v-icon>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>{{alertDialog.mensaje}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="error" @click="closeDialog()">{{alertDialog.item ?"Cancelar":"Aceptar"}}</v-btn>
            <v-btn v-if="alertDialog.item" flat color="info" @click="darBaja()">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
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

import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  name: "ListaEdiciones",
  mixins: [columnasMixin, usuarioMixin],

  data() {
    return {
      ediciones: [],
      edicion: {
        id: null,
        idUsuarioCreador: null
      },
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Artículo", value: "nombreArticulo"},
        { text: "Fecha Edición", value: "fechaEdicion"},
        { text: "Nro. Edición", value: "nroEdicion"},
        { text: "Precio Venta", value: "precioVenta"},
        { text: "Precio Rendición", value: "precioRendicion"},
        //{ text: "Cant. Ingreso", value: "cantidadInicial" },
        { text: "Cantidad", value: "cantidadActual"},
        //{ text: "En stock", value: "activo"}
      ],
      alertDialog: {
        titulo: "",
        mensaje: "",
        id: null,
        icono: null,
        mostrar: false,
        item: null
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
        .get(`${process.env.VUE_APP_ROOT_API}ediciones`)
        .then(response => {
          this.ediciones = response.data;
          this.cargando = false;
          this.getError = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    showAlert(item) {
      if (item.activo) {
        this.alertDialog.titulo = "Baja de stock";
        this.alertDialog.mensaje =
          "Si da de baja una edición, ya no podrá realizar distribuciones con dicha edición. Desea dar de baja el stock ?";
        this.alertDialog.icono = "warning";
        this.alertDialog.item = item;
      } else {
        this.alertDialog.titulo = "Info";
        this.alertDialog.mensaje =
          "Solo puede dar de alta una edición a través de un ingreso ";
        this.alertDialog.icono = "info";
      }
      this.alertDialog.mostrar = true;
    },
    closeDialog() {
      this.alertDialog.mostrar = false;
      this.alertDialog.item = null;
    },
    darBaja() {
  
      this.edicion.idUsuarioCreador = this.getUserId();
      this.edicion.id = this.alertDialog.item.id;

      this.$http
          .post(`${process.env.VUE_APP_ROOT_API}ediciones`, this.edicion)
        .then(response => {
          this.listar();
          /*this.ediciones.map(u => {
           if (u.id == this.alertDialog.item.id) {
              u.activo = !u.activo;
            }
          });*/
          this.closeDialog();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
          this.closeDialog();
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