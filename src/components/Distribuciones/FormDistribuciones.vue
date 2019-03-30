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
            <v-card-text v-on:keyup.enter="guardar">
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    class="mx-3"
                    label="Nro. Documento"
                    v-model="nroDocumento"
                    :append-icon="this.id? '' : 'search'"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    label="Vendedor"
                    v-model="distribucion.idVendedor"
                    :items="vendedores"
                    item-value="id"
                    item-text="nombreCompleto"
                    required
                    @input="$v.distribucion.idVendedor.$touch()"
                    @blur="$v.distribucion.idVendedor.$touch()"
                    :error-messages="mensajeValidacion['IdVendedor'] || vendedorError"
                  ></v-select>
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
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <v-btn
                      
                      class="ml-3"
                      
                      
                      :outline="!activarDetalle"
                      @click="abrirFormDetalle"
                      color="teal"
                      dark
                    >Articulos
                      <v-icon small class="ml-1">launch</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-data-table
                    class="scrollable"
                    :headers="headers"
                    :items="distribucion.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.nombreArticulo }}</td>
                      <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                      <td class="text-xs-right">{{ props.item.nroEdicion }}</td>
                      <td class="text-xs-right">
                        <!--<template v-if="modoLectura">{{props.item.cantidad}}</template>-->
                        <template >
                          <v-text-field
                            class="style-input"
                            type="number"
                            v-model="props.item.cantidad"
                            :error-messages="mensajeValidacion[`Detalle[${distribucion.detalle.indexOf(props.item)}].Cantidad`]"
                            @focus="limpiarDetalle(props.item)"
                          ></v-text-field>
                        </template>
                      </td>
                      <td class="text-xs-right">{{ props.item.precioVenta }}</td>
                      <td class="text-xs-right">{{ props.item.precioRendicion }}</td>
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
            <buscador-ediciones
              :detalle="distribucion.detalle"
              @close="mostrarBuscador = false"
              @quitar="quitarItem"
            ></buscador-ediciones>
          </v-dialog>
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
      distribucion: {
        id: null,
        idVendedor: null,
        idUsuarioCreador: null,
        fechaCreacion: new Date(),
        detalle: []
      },
      headers: [
        { text: "Artículo", value: "nombreArticulo" },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Edición Nro.", value: "nroEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false, width: "12%" },
        { text: "Precio Venta", value: "precioVenta", sortable: false },
        { text: "Precio Rendición", value: "precioRendicion", sortable: false }
      ],
      nroDocumento: null,
      vendedores: [],
      cargando: false,
      guardando: false,
      getError: false,
      mostrarBuscador: false,
      activarDetalle: false,
      mensajeValidacion: [],
      dialogDetalle: false,
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
    this.getVendedores();
    if (this.id) {
      this.getDistribucion();
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
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getVendedores() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}vendedores/`)
        .then(response => {
          this.vendedores = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    quitarItem(item) {
      //item.cantidad = null;
      this.distribucion.detalle.forEach(d => this.limpiarDetalle(d));
      this.distribucion.detalle = this.distribucion.detalle.filter(
        d => d.idEdicion != item.idEdicion
      );
    },
    abrirFormDetalle() {
      this.$v.distribucion.idVendedor.$touch();
      if (this.distribucion.idVendedor != null) {
        this.mostrarBuscador = true;
      }
    },
    limpiarDetalle(item) {
      delete this.mensajeValidacion[
        `Detalle[${this.distribucion.detalle.indexOf(item)}].Cantidad`
      ];
    },
    guardar() {
      this.guardando = true;
      if (this.distribucion.id) {
        // Editar
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
      this.getVendedores();
      if (this.id) {
        this.getDistribucion();
      }
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
    modoLectura() {
      return this.id ? true : false;
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
</style>
