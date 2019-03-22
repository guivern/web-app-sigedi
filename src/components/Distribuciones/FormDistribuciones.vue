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
          <!-- FORMULARIO DE DISTRIBUCION -->
          <v-card>
            <v-card-text v-on:keyup.enter="guardar">
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-text-field class="mx-3" label="Nro. Documento" v-model="nroDocumento"></v-text-field>
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
                    <span style="display:inline" class="title">Artículos</span>
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <v-btn
                      class="ml-3"
                      small
                      fab
                      :outline="!activarDetalle"
                      @click="abrirFormDetalle"
                      color="teal"
                      dark
                    ><v-icon>launch</v-icon> </v-btn>
                  </v-toolbar>
                  <v-data-table
                    class="mx-3"
                    :headers="headers"
                    :items="distribucion.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.nombreArticulo }}</td>
                      <td>{{ props.item.nroEdicion }}</td>
                      <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                      <td>
                        <v-text-field type="number" v-model="props.item.cantidad"></v-text-field>
                      </td>
                      <td>{{ props.item.precioVenta }}</td>
                      <td>{{ props.item.precioRendicion }}</td>
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
        { text: "Edición Nro.", value: "nroEdicion", sortable: false },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false, width: "5%" },
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
  },
  methods: {
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
      this.distribucion.detalle = this.distribucion.detalle.filter(d => d.id != item.id);
    },
    abrirFormDetalle() {
      this.$v.distribucion.idVendedor.$touch();
      if (this.distribucion.idVendedor != null) {
        this.mostrarBuscador = true;
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
      return this.id ? "Detalle de distribución" : "Registro de distribución";
    },
    idVendedor() {
      return this.distribucion.idVendedor;
    },
    vendedorError() {
      const errors = [];
      if (!this.$v.distribucion.idVendedor.$dirty) return errors;
      !this.$v.distribucion.idVendedor.required && errors.push("Es requerido.");
      return errors;
    }
  }
};
</script>
