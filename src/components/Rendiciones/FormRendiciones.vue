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
          <!--<v-btn-toggle v-if="!modoCarga" v-model="toggle_exclusive" light>
            <v-btn flat @click="activarModoLectura">
              <v-icon>visibility</v-icon>
            </v-btn>
          </v-btn-toggle>-->
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
          <!-- FORMULARIO DE RENDICION -->
          <v-card>
            <v-card-text v-on:keyup.enter="guardar">
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    class="mx-3"
                    label="Nro. Documento"
                    :disabled="modoLectura || modoEdicion"
                    v-model="nroDocumento"
                    :append-icon="modoLectura? '' : 'search'"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    :disabled="modoLectura || modoEdicion"
                    v-model="rendicion.idVendedor"
                    :items="vendedores"
                    item-text="nombreCompleto"
                    item-value="id"
                    label="Vendedor"
                    :loading="cargando"
                    required
                    @input="$v.rendicion.idVendedor.$touch()"
                    @blur="$v.rendicion.idVendedor.$touch()"
                    :error-messages="mensajeValidacion['IdVendedor'] || vendedorError"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <!-- LISTA DETALLE -->
          <v-card>
            <v-card-text>
              <v-layout row wrap>
                <v-flex>
                  <v-toolbar flat color="white">
                    <span style="display:inline" class="title">Detalle</span>
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <v-btn
                      v-if="!modoLectura"
                      :outline="!activarDetalle"
                      color="info"
                      dark
                    >Agregar</v-btn>
                  </v-toolbar>
                  <v-data-table
                    class="mx-3"
                    :headers="headers"
                    :items="rendicion.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <!--<td v-if="props.item.editable && !modoLectura">
                        <v-icon @click="quitarDetalle(props.item)">delete</v-icon>
                      </td>
                      <td v-else>
                        <v-icon>delete_outlined</v-icon>
                      </td>-->
                    </template>
                    <template slot="no-data">
                      <div
                        class="text-xs-center"
                        v-if="!mensajeValidacion.hasOwnProperty('Detalle')"
                      >
                        <v-icon class="mx-2" color="success">info</v-icon>Seleccione un vendedor y luego haga click en "agregar" para agregar detalle.
                      </div>
                      <div class="text-xs-center" v-else>
                        <v-icon class="mx-2">error</v-icon>Debe agregar al menos una rendición al detalle.
                      </div>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
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
    <v-snackbar :timeout="1500" bottom v-model="snackbar.visible" :color="snackbar.color">
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

export default {
  name: "FormRendiciones",
  mixins: [usuarioMixin, columnasMixin, validationMixin],
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      rendicion: {
        id: null,
        idVendedor: null,
        idUsuarioCreador: null,
        idUsuarioModificador: null,
        fechaCreacion: new Date(),
        detalle: [],
        editable: true,
        anulable: true
      },
      headers: [
        { text: "Opciones", value: "opciones" },
        { text: "Artículo", value: "nombreArticulo" },
        { text: "Edición Nro.", value: "nroEdicion", sortable: false },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false },
        { text: "Devoluciones", value: "", sortable: false },
        { text: "Monto", value: "", sortable: false },
        { text: "Importe", value: "", sortable: false },
        { text: "Saldo", value: "", sortable: false },
      ],
      nroDocumento: null,
      vendedores: [],
      cargando: false,
      guardando: false,
      getError: false,
      activarDetalle: false,
      mensajeValidacion: [],
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
    rendicion: {
      idVendedor: { required }
    }
  },
  created() {
    this.getDatos();
    if (this.id) {
      this.modoLectura = true;
      this.toggle_exclusive = 0;
    } else {
      this.modoCarga = true;
    }
  },
  methods: {
    getDatos() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}vendedores/`)
        .then(response => {
          this.vendedores = response.data;
          if (this.id) {
            this.getRendicion();
          } else {
            this.cargando = false;
          }
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getRendicion() {
      //TODO
    },
    listarDistribuciones() {
      //TODO
    },
    guardar() {
      //TODO
    },
    recargar() {
      this.getDatos();
      if (this.id) {
        this.modoLectura = true;
        this.toggle_exclusive = 0;
      } else {
        this.modoCarga = true;
      }
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Registro de Rendición" : "Detalle de Rendición";
    },
    idVendedor() {
      return this.rendicion.idVendedor;
    },
    vendedorError() {
      const errors = [];
      if (!this.$v.rendicion.idVendedor.$dirty) return errors;
      !this.$v.rendicion.idVendedor.required && errors.push("Es requerido.");
      return errors;
    }
  },
  watch: {
    idVendedor(newValue, oldValue) {
      if (oldValue != null) {
        this.rendicion.detalle = [];
      }

      if (this.idVendedor) {
        // obtenemos las distribuciones pendientes de  rendicion del vendedor
        this.activarDetalle = true;
        this.listarDistribuciones();
      }

      let vendedor = this.vendedores.find(
        v => v.id == this.rendicion.idVendedor
      );

      this.nroDocumento = vendedor && vendedor.numeroDocumento;
    },
    nroDocumento() {
      if (this.nroDocumento) {
        let vendedor = this.vendedores.find(
          v => v.numeroDocumento == this.nroDocumento
        );
        this.rendicion.idVendedor = vendedor && vendedor.id;
        this.activarDetalle = this.rendicion.idVendedor && true;
      }
    }
  }
};
</script>

