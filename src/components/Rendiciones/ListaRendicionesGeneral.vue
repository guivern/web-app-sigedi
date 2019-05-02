<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Rendiciones</v-toolbar-title>
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
          :items="rendiciones"
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
                @click="$router.push({path: '/rendiciones/' + props.item.id, append: true})"
              >visibility</v-icon>
              <template v-if="props.item.anulado">
                <span>ANULADO</span>
              </template>
            </td>
            <td class="text-xs-right">{{ props.item.idCaja }}</td>
            <td>{{ props.item.cajero }}</td>
            <td class="text-xs-right">{{ props.item.id }}</td>
            <td>{{ columnDate(props.item.fechaCreacion) }}</td>
            <td>{{ props.item.nombreVendedor }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.montoTotal) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.importeTotal) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.saldoTotal) }}</td> 
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
import usuarioMixin from "../../mixins/columnasMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      rendiciones: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Id Caja", value: "idCaja", align: "right" },
        { text: "Cajero", value: "cajero" },
        { text: "Id Rendición", value: "id", align: "right" },
        { text: "Fecha - Hora", value: "fechaCreacion" },
        { text: "Vendedor", value: "nombreVendedor" },
        {
          text: "Total Monto",
          value: "montoTotal",
          align: "right"
        },
        {
          text: "Total Importe",
          value: "importeTotal",
          align: "right"
        },
        {
          text: "Total Deuda",
          value: "saldoTotal",
          align: "right"
        }
        //{ text: "Usuario", value: "nombreUsuario", width: "7%" }
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
        .get(`${process.env.VUE_APP_ROOT_API}rendiciones?Inactivos=true`)
        .then(response => {
          this.rendiciones = response.data;
          this.cargando = false;
          this.getError = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
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