<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-toolbar color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">
            <v-btn icon @click="$router.push('..')" type="button">
              <v-icon>arrow_back</v-icon>
            </v-btn>
            Detalle de Deuda
          </v-toolbar-title>
          <v-spacer></v-spacer>
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
                  <v-text-field readonly class="mx-3" label="Vendedor" :value="deuda.vendedor" prepend-icon="person"></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    readonly
                    class="mx-3"
                    label="Nro. Documento"
                    :value="columnMoney(deuda.nroDocumento)"
                    prepend-icon="subtitles"
                  ></v-text-field>
                </v-flex>
                <v-flex xs6 sm6 md4>
                  <v-text-field
                    readonly
                    class="mx-3"
                    label="Total Deuda Gs."
                    :value="columnMoney(deuda.totalDeuda)"
                    outline
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
                  </v-toolbar>
                  <v-data-table
                    class="scrollable"
                    :headers="headers"
                    :items="deuda.detalle"
                    :loading="cargando"
                    hide-actions
                  >
                    <template slot="items" slot-scope="props">
                      <td>{{ props.item.nombreArticulo }}</td>
                      <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
                      <!--<td class="text-xs-right">{{ columnMoney(props.item.nroEdicion) }}</td>-->
                      <td class="text-xs-right">{{ columnMoney(props.item.precioRendicion) }}</td>
                      <td class="text-xs-right">{{ props.item.cantidad }}</td>
                      <td class="text-xs-right">{{ props.item.devoluciones }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.monto) }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.importe) }}</td>
                      <td class="text-xs-right">{{ columnMoney(props.item.saldo) }}</td>
                    </template>
                    
                  </v-data-table>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
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
import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  name: "FormDeudas",
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
      headers: [
        {text: "Nombre del artículo",value: "nombreArticulo",sortable: false},
        {text: "Fecha Edición",value: "fechaEdicion",sortable: false,width: "7%"},
        //{text: "Edición Nro.",value: "nroEdicion",sortable: false,width: "7%"},
        {text: "Precio Unit.",value: "precioRendicion",sortable: false,width: "7%"},
        { text: "Cantidad", value: "cantidad", sortable: false, width: "7%" },
        { text: "Devoluciones", value: "devoluciones", sortable: false, width: "7%" },
        { text: "Monto", value: "monto", sortable: false, width: "7%" },
        { text: "Importe", value: "importe", sortable: false, width: "7%" },
        { text: "Saldo", value: "saldo", sortable: false, width: "7%" },
      ],
      deuda: null,
      cargando: false,
      guardando: false,
      getError: false,
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
      this.getDeuda();
    }
  },
  methods: {
    getDeuda() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}deudas/vendedor/${this.id}`)
        .then(response => {
          this.deuda = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    recargar() {
      if (this.id) {
        this.getDeuda();
      }
    }
  }
};
</script>
<style>
.scrollable {
  max-height: 300px;
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
