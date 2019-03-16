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
        </v-toolbar>

        <div v-if="cargando" class="text-xs-center" style="padding:50px">
          <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
        </div>
        <div v-if="getError" class="text-xs-center" style="padding:50px">
          <v-alert
            :value="getError"
            transition="scale-transition"
            type="error"
            outline
          >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
          <v-btn color="info" title="recargar" @click="recargar()">Reintentar
            <v-icon small>refresh</v-icon>
          </v-btn>
        </div>
        <template v-if="!cargando && !getError">
          <!-- FORMULARIO DE INGRESO -->
          <v-card>
            <v-card-text v-on:keyup.enter="guardar">
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    class="mx-3"
                    v-model="ingreso.numeroComprobante"
                    label="Nro. Comprobante"
                    :error-messages="mensajeValidacion['NumeroComprobante']"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    v-model="ingreso.tipoComprobante"
                    :items="tiposCompronate"
                    label="Tipo Comprobante"
                    :error-messages="mensajeValidacion['TipoComprobante']"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    v-model="ingreso.idProveedor"
                    :items="proveedores"
                    item-text="razonSocial"
                    item-value="id"
                    label="Proveedor"
                    :loading="cargando"
                    :error-messages="mensajeValidacion['IdProveedor']"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <!-- FORMULARIO DETALLE -->
          <v-dialog v-model="dialogDetalle" max-width="500px">
            <v-card>
              <v-toolbar flat dark class="secondary" dense>
                <v-toolbar-title>
                  <span class="headline">Ingreso de stock</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-divider></v-divider>
              <v-card-text v-on:keyup.enter="guardar">
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs6 sm6 md6>
                      <v-select
                        :items="articulos"
                        item-text="descripcion"
                        v-model="detalle.articulo"
                        label="Artículo"
                        :loading="getArticulos"
                        return-object
                      ></v-select>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field type="number" label="Cantidad" v-model="detalle.cantidad"></v-text-field>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field type="number" label="Edición Nro." v-model="detalle.nroEdicion"></v-text-field>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field
                        type="date"
                        label="Fecha Edición"
                        v-model="detalle.fechaEdicion"
                      ></v-text-field>
                    </v-flex>

                    <v-flex xs6 sm6 md6>
                      <v-select
                        :items="precios"
                        item-text="precioVenta"
                        v-model="detalle.precio"
                        label="Precio Venta"
                        :loading="getPrecios"
                        return-object
                      ></v-select>
                    </v-flex>
                    <v-flex xs6 sm6 md6>
                      <v-text-field
                        readonly
                        :value="detalle.precio?detalle.precio.precioRendVendedor:null"
                        type="number"
                        label="Precio Rendición"
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" flat :disabled="guardando" @click="close">Cancelar</v-btn>
                <v-btn flat color="primary" :loading="guardando" @click="agregarDetalle">Agregar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!--LISTA DE detalle -->
          <v-card>
            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-toolbar flat color="white">
                    <h3 style="display:inline">Detalle</h3>
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <v-btn
                      :outline="!activarDetalle"
                      color="info"
                      dark
                      @click="abrirFormDetalle"
                    >Agregar</v-btn>
                  </v-toolbar>
                  <v-data-table
                    class="mx-3"
                    :headers="headers"
                    :items="ingreso.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.nombreArticulo }}</td>
                      <td>{{ props.item.nroEdicion }}</td>
                      <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                      <td>{{ props.item.cantidad }}</td>
                      <td>{{ props.item.precioVenta }}</td>
                      <td>{{ props.item.precioRendicion }}</td>
                    </template>
                    <template slot="no-data">
                      <div
                        class="text-xs-center"
                        v-if="!mensajeValidacion.hasOwnProperty('Detalle')"
                      ><v-icon class="mx-2" color="success">info</v-icon>Seleccione un proveedor y luego haga click en "agregar" para ingresar artículos.</div>
                      <div class="text-xs-center" v-else>
                        <v-icon class="mx-2">error</v-icon>Debe ingresar al menos un precio de venta y rendición.
                      </div>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-btn
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
    <v-snackbar :timeout="1500" bottom v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon class="ml-2">{{snackbar.icon}}</v-icon>
    </v-snackbar>
  </v-layout>
</template>

<script>
import usuarioMixin from "../../mixins/usuarioMixin.js"
import columnasMixin from "../../mixins/columnasMixin.js"
export default {
  name: "FormIngresos",
  mixins: [usuarioMixin, columnasMixin],
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      ingreso: {
        id: null,
        idProveedor: null,
        idUsuarioCreador: null,
        tipoComprobante: null,
        numeroComprobante: null,
        detalle: []
      },
      detalle: {
        articulo: null,
        precio: null,
        cantidad: null,
        fechaEdicion: null,
        nroEdicion: null
      },
      detalleDefault: {
        articulo: null,
        precio: null,
        cantidad: null,
        fechaEdicion: null,
        nroEdicion: null
      },
      tiposCompronate: ["Boleta", "Recibo", "Factura"],
      proveedores: [],
      headers: [
        { text: "Artículo", value: "nombreArticulo"},
        { text: "Edición Nro.", value: "nroEdicion", sortable: false},
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false},
        {text: "Precio Venta",value: "precioVenta", sortable: false},
        {text: "Precio Rendición", value: "precioRendicion", sortable: false}
      ],
      cargando: false,
      guardando: false,
      getError: false,
      activarDetalle: false,
      mensajeValidacion: [],
      dialogDetalle: false,
      getArticulos: false,
      getPrecios: false,
      articulos: [],
      precios: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        icon: "info"
      }
    };
  },
  created() {
    if (this.id) {
      this.getingreso();
    }
    this.getProveedores();
  },
  methods: {
    getingreso() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ingresos/${this.id}?Inactivo=true`)
        .then(response => {
          this.ingreso = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    listarArticulos() {
      this.getArticulos = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/proveedor/${
            this.idProveedor
          }`
        )
        .then(response => {
          this.articulos = response.data;
          this.getArticulos = false;
        })
        .catch(error => {
          console.log(error);
          this.getArticulos = false;
          //this.getError = true;
        });
    },
    listarPrecios() {
      this.getPrecios = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/${
            this.detalle.articulo.id
          }/precios`
        )
        .then(response => {
          this.precios = response.data;
          this.getPrecios = false;
        })
        .catch(error => {
          console.log(error);
          this.getPrecios = false;
          //this.getError = true;
        });
    },
    getProveedores() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}proveedores/`)
        .then(response => {
          this.proveedores = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    agregarDetalle() {
      this.ingreso.detalle.push({
        id: null,
        idArticulo: this.detalle.articulo ? this.detalle.articulo.id : null,
        idPrecio: this.detalle.precio ? this.detalle.precio.id : null,
        cantidad: this.detalle.cantidad,
        fechaEdicion: this.detalle.fechaEdicion,
        nroEdicion: this.detalle.nroEdicion,
        nombreArticulo:this.detalle.articulo.descripcion,
        precioVenta: this.detalle.precio.precioVenta,
        precioRendicion: this.detalle.precio.precioRendVendedor
      });
      this.limpiar();
      this.dialogDetalle = false;
    },
    abrirFormDetalle(){
        if(this.idProveedor != null){
            this.dialogDetalle = true
        }
        else{
            this.snackbar.color = "error";
            this.snackbar.message = "Debe seleccionar un proveedor";
            this.snackbar.icon = "error";
            this.snackbar.visible = true;
        }
    },
    eliminarDetalle(item) {
      item.activo = false;
      /*this.ingreso.detalle = this.ingreso.detalle.filter(
        p => p.id != item.id || p.index != item.index
      );*/
    },
    limpiar() {
      this.detalle = Object.assign({}, this.detalleDefault);
    },
    close() {
      this.limpiar();
      this.dialogDetalle = false;
    },
    guardar() {
      this.guardando = true;
      if (this.ingreso.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}ingresos/${this.ingreso.id}`,
            this.ingreso
          )
          .then(response => {
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Actualización exitosa";
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
        this.ingreso.idUsuarioCreador = this.getUserId();
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}ingresos`, this.ingreso)
          .then(response => {
            this.guardando = false;
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Registro exitoso";
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
      }
    },
    recargar() {
      if (this.id) {
        this.getingreso();
      }
      this.getProveedores();
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Registro de ingreso" : "Detalle de ingreso";
    },
    idProveedor() {
      return this.ingreso.idProveedor;
    },
    idArticulo() {
      if (this.detalle.articulo != null) {
        return this.detalle.articulo.id;
      }
      return null;
    }
  },
  watch: {
    idProveedor() {
      if (this.idProveedor != null && this.id == null) {
        // obtenemos los articulos del proveedor
        this.activarDetalle = true;
        this.listarArticulos();
        this.ingreso.detalle = [];
      }
    },
    idArticulo() {
      if (this.idArticulo != null) {
        // obtenemos los precios del articulo
        this.listarPrecios();
      }
    }
  }
};
</script>

<style scoped>
.icon:hover {
  color: #ff5252;
}
.icon {
  color: grey;
}
</style>