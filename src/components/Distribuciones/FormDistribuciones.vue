<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-toolbar color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">
            <v-btn icon @click="$router.push('.')" type="button">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            {{formTitle}}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn-toggle v-if="!modoCarga" v-model="toggle_exclusive" light>
            <v-btn flat @click="activarModoLectura">
              <v-icon>visibility</v-icon>
            </v-btn>
            <v-divider vertical></v-divider>
            <v-btn flat @click="activarModoEdicion">
              <v-icon>edit</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-toolbar>

        <div v-if="cargando" class="text-xs-center" style="padding:50px">
          <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
          <p class="mt-2">Cargando...</p>
        </div>
        <div v-if="getError" class="text-xs-center" style="padding:50px">
          <v-alert
            :value="getError"
            transition="scale-transition"
            type="error"
            outline
          >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
          <v-btn color="info" title="recargar" @click="recargar()">
            Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
        </div>
        <template v-if="!cargando && !getError">
          
          <!-- FORMULARIO DE DISTRIBUCION -->
          <v-card>
            <v-card-text>
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-autocomplete
                    :readonly="modoLectura || (!modoLectura && !distribucion.editable)"
                    class="mx-3"
                    label="Vendedor"
                    placeholder="Ingrese el nombre del vendedor"
                    v-model="distribucion.idVendedor"
                    :items="vendedores"
                    item-value="id"
                    item-text="nombreCompleto"
                    required
                    :error-messages="mensajeValidacion['IdVendedor']"
                    prepend-icon="person"
                    :autofocus="modoCarga"
                  ></v-autocomplete>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    :readonly="modoLectura || (!modoLectura && !distribucion.editable)"
                    class="mx-3"
                    label="Nro. Documento"
                    v-model="nroDocumento"
                    prepend-icon="subtitles"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          
          <!--LISTA DETALLE -->
          <v-card>
            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-toolbar flat color="white">
                    <span style="display:inline" class="title">Detalle</span>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <!--<v-spacer></v-spacer>-->
                    <v-btn
                      v-if="modoCarga"
                      @click="mostrarBuscador = true"
                      color="info"
                      dark
                    >Agregar</v-btn>
                  </v-toolbar>
                  <v-data-table
                    class="scrollable"
                    :headers="headers"
                    :items="distribucion.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td>
                        <v-icon right v-if="props.item.editable && !modoLectura" @click="quitarDetalle(props.item)">delete</v-icon>
                        <v-icon right v-else>delete_outlined</v-icon>
                      </td>
                      <td>{{ props.item.nombreArticulo }}</td>
                      <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.nroEdicion) }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.precioRendicion) }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.precioVenta) }}</td>
                      <td class="text-xs-right">
                        <template v-if="modoLectura">{{props.item.cantidad}}</template>
                        <template v-else>
                          <v-text-field
                            :readonly="modoLectura || (!modoLectura && !props.item.editable)"
                            class="style-input"
                            type="number"
                            v-model="props.item.cantidad"
                            :error-messages="mensajeValidacion[`Detalle[${distribucion.detalle.indexOf(props.item)}].Cantidad`]"
                            @focus="limpiarDetalle(props.item)"
                          ></v-text-field>
                        </template>
                      </td>
                      
                    </template>
                    <template slot="no-data">
                      <div
                        class="text-xs-center"
                        v-if="!mensajeValidacion.hasOwnProperty('Detalle')"
                      >
                        <v-icon class="mx-2" color="success">info</v-icon>Seleccione un vendedor y luego haga click en el ícono para agregar artículos.
                      </div>
                      <div class="text-xs-center" v-else>
                        <v-icon class="mx-2">error</v-icon>Debe agregar al menos un artículo al detalle.
                      </div>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>

          <!-- BUSCADOR ARTICULOS -->
          <v-dialog v-model="mostrarBuscador" max-width="700px">
            <v-card>
              <v-toolbar color="secondary" flat dark dense extense>
                <v-toolbar-title>Artículos en stock</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn dark flat @click.native="cerrarBuscador">Cerrar</v-btn>
              </v-toolbar>
              <v-card-text>
                <v-flex xs12>
                  <template>
                    <v-text-field
                      append-icon="search"
                      class="text-xs-center"
                      v-model="nombre"
                      autofocus
                      label="Buscar"
                    ></v-text-field>
                    <v-data-table
                      :headers="headerArticulos"
                      :items="ediciones"
                      :loading="cargando"
                      :disable-initial-sort="true"
                      :search="nombre"
                      hide-actions
                      class="scrollable-list"
                    >
                      <template slot="items" slot-scope="props">
                        <td>
                          <v-checkbox
                            v-model="props.item.selected"
                            @change="seleccionDeEdicion(props.item)"
                            :label="props.item.nombreArticulo"
                          ></v-checkbox>
                        </td>
                        <td
                          class="text-xs-center"
                        >{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                        <td class="text-xs-right">{{ columnMoney(props.item.nroEdicion) }}</td>
                        <td class="text-xs-right">{{ props.item.cantidadActual }}</td>
                      </template>
                      <template slot="no-data">
                        <div class="text-xs-center">{{mensaje}}</div>
                      </template>
                    </v-data-table>
                  </template>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-btn
            v-if="!modoLectura"
            fixed
            dark
            fab
            bottom
            right
            type="button"
            title="Guardar"
            color="success"
            @click="guardar"
            :loading="guardando"
          >
            <v-icon>send</v-icon>
          </v-btn>
        </template>
      </v-card>
    </v-flex>
    <v-snackbar :timeout="1200" bottom v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon class="ml-2">{{snackbar.icon}}</v-icon>
    </v-snackbar>
  </v-layout>
</template>
<script>
import { validationMixin } from "vuelidate";
import { required, between } from "vuelidate/lib/validators";
import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
import buscadorEdiciones from "../Articulos/BuscadorEdiciones";
export default {
  name: "FormDistribuciones",
  mixins: [usuarioMixin, columnasMixin, validationMixin],
  components: { buscadorEdiciones },
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      toggle_exclusive: 2,
      distribucion: {
        id: null,
        idVendedor: null,
        idUsuarioCreador: null,
        fechaCreacion: new Date(),
        detalle: [],
        editable: true,
        anulable: true
      },
      headers: [
        { text: "", value: "opciones", sortable: false, width:"7%" },
        { text: "Nombre del artículo", value: "nombreArticulo", sortable: false },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false, width:"7%" },
        { text: "Edición Nro.", value: "nroEdicion", sortable: false, width:"7%" },
        { text: "Precio Rendición", value: "precioRendicion", sortable: false, width:"7%" },
        { text: "Precio Venta", value: "precioVenta", sortable: false, width:"7%" },
        { text: "Cantidad", value: "cantidad", sortable: false, width:"7%" },
        
      ],
      headerArticulos: [
        { text: "Nombre del artículo", value: "nombreArticulo", width:"50%" },
        { text: "Fecha Edición", value: "fechaEdicion" },
        { text: "Nro. Edición", value: "nroEdicion" },
        { text: "Cantidad", value: "cantidadActual" }
      ],
      ediciones: [],
      nombre: null,
      nroDocumento: null,
      vendedores: [],
      cargando: false,
      guardando: false,
      getError: false,
      mostrarBuscador: false,
      activarDetalle: false,
      mensajeValidacion: [],
      dialogDetalle: false,
      modoLectura: false,
      modoEdicion: false,
      modoCarga: false,
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        icon: "info"
      }
    };
  },
  validations: {
    distribucion: {
      idVendedor: { required }
    }
  },
  created() {
    this.getRegistros();
    if (this.id) {
      this.modoLectura = true;
      this.toggle_exclusive = 0;
    } else {
      this.modoCarga = true;
    }
  },
  methods: {
    getDistribucion() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}distribuciones/${
            this.id
          }?Inactivo=true`
        )
        .then(response => {
          this.distribucion = response.data;
          this.getEdiciones();
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getRegistros() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}vendedores/`)
        .then(response => {
          this.vendedores = response.data;
          if (this.id) {
            this.getDistribucion();
          } else {
            this.getEdiciones();
          }
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getEdiciones() {
      this.cargando = true;

      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ediciones`)
        .then(response => {
          this.getOk = true;
          this.ediciones = response.data;
          for (var i = 0; i < this.ediciones.length; i++) {
            for (var j = 0; j < this.distribucion.detalle.length; j++) {
              if (
                this.ediciones[i].id == this.distribucion.detalle[j].idEdicion
              ) {
                this.ediciones[i].selected = true;
                this.distribucion.detalle[j].selected = true;
              }
            }
          }
          this.cargando = false;
        })
        .catch(error => {
          this.cargando = false;
          this.getError = true;
        });
    },
    seleccionDeEdicion(item) {
      item.idEdicion = item.id ? item.id : item.idEdicion;
      if (item.selected) {
        this.agregarDetalle(item);
      } else {
        this.quitarDetalle(item);
      }
    },
    agregarDetalle(item) {
      if (!this.distribucion.detalle.some(d => d.idEdicion == item.idEdicion)) {
        this.distribucion.detalle.push({
          idEdicion: item.idEdicion,
          cantidad: null,
          nombreArticulo: item.nombreArticulo,
          nroEdicion: item.nroEdicion,
          fechaEdicion: item.fechaEdicion,
          precioVenta: item.precioVenta,
          precioRendicion: item.precioRendicion,
          id: null,
          anulable: true,
          editable: true
        });
      }
    },
    quitarDetalle(item) {
      this.distribucion.detalle.forEach(d => this.limpiarDetalle(d));
      this.distribucion.detalle = this.distribucion.detalle.filter(
        d => d.idEdicion != item.idEdicion
      );
      this.ediciones.forEach(e => {
        if (e.id == item.idEdicion) {
          e.selected = false;
        }
      });
    },
    limpiarDetalle(item) {
      delete this.mensajeValidacion[
        `Detalle[${this.distribucion.detalle.indexOf(item)}].Cantidad`
      ];
    },
    cerrarBuscador() {
      this.nombre = null;
      this.mostrarBuscador = false;
    },
    guardar() {
      this.guardando = true;
      if (this.distribucion.id) {
        // Editar
        this.distribucion.idUsuarioModificador = this.getUserId();
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}distribuciones/${
              this.distribucion.id
            }`,
            this.distribucion
          )
          .then(response => {
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Registro actualizado";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push(".");
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              this.mensajeValidacion = error.response.data.errors
                ? error.response.data.errors
                : error.response.data;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.icon = "error";
              this.snackbar.visible = true;
            }
          });
      } else {
        // Guardar
        this.distribucion.idUsuarioCreador = this.getUserId();
        this.distribucion.detalle.forEach(d => (d.id = null));
        this.$http
          .post(
            `${process.env.VUE_APP_ROOT_API}distribuciones`,
            this.distribucion
          )
          .then(response => {
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Registro guardado";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push({
                path: "/distribuciones/" + response.data.id
              });
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              this.mensajeValidacion = error.response.data.errors
                ? error.response.data.errors
                : error.response.data;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.icon = "error";
              this.snackbar.visible = true;
            }
          });
      }
    },
    recargar() {
      this.getRegistros();
      if (this.id) {
        this.modoLectura = true;
        this.toggle_exclusive = 0;
      } else {
        this.modoCarga = true;
      }
    },
    activarModoEdicion() {
      if (!this.distribucion.anulado && this.distribucion.detalle.some(d => d.editable)) {
        this.modoLectura = false;
        this.modoEdicion = true;
      } else {
        this.snackbar.color = "error";
        this.snackbar.message = this.distribucion.anulado ? "Distribución anulada." : "No se puede editar." ;
        this.snackbar.icon = "error";
        this.snackbar.visible = true;
      }
    },
    activarModoLectura() {
      this.modoLectura = true;
      this.modoEdicion = false;
    }
  },
  watch: {
    nroDocumento() {
      let vendedor = this.vendedores.find(
        v => v.numeroDocumento == this.nroDocumento
      );
      this.distribucion.idVendedor = vendedor && vendedor.id;
    },
    idVendedor() {
      let vendedor = this.vendedores.find(
        v => v.id == this.distribucion.idVendedor
      );
      this.nroDocumento = vendedor && vendedor.numeroDocumento;
      this.activarDetalle = this.distribucion.idVendedor ? true : false;
    }
  },
  computed: {
    formTitle() {
      return this.id ? "Detalle de Distribución" : "Registro de Distribución";
    },
    idVendedor() {
      return this.distribucion.idVendedor;
    },
    vendedorError() {
      const errors = [];
      if (!this.$v.distribucion.idVendedor.$dirty) return errors;
      !this.$v.distribucion.idVendedor.required && errors.push("Es requerido.");
      return errors;
    },
    mensaje() {
      if (this.getError) {
        return "Ocurrió un error al intentar obtener los datos, revise su conexión e intente nuevamente.";
      } else {
        return "Aquí apareceran los artículos en stock.";
      }
    }
  }
};
</script>
<style>
.scrollable {
  max-height: 350px;
  overflow-y: auto;
}
.style-input input {
  text-align: right;
  font-size: 0.9em;
}
.scrollable-list {
  /*max-height: 400px;*/
  height: 300px;
  overflow-y: auto;
}
</style>
