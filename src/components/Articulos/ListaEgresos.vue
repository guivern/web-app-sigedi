<template>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Egresos</v-toolbar-title>
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
          :items="egresos"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :disable-initial-sort="true"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.nombreArticulo }}</td>
            <td class="text-xs-center">{{ columnDateWithoutTime(props.item.fecha) }}</td>
            <td class="text-xs-right">{{ props.item.nroEdicion }}</td>
            <td class="text-xs-right">{{ props.item.precioVenta }}</td>
            <td class="text-xs-right">{{ props.item.precioRendicion }}</td>
            <td class="text-xs-right">{{ props.item.cantidad }}</td>
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
  </v-layout>
</template>

<script>
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  name: "ListaEgresos",
  mixins: [columnasMixin],
  data() {
    return {
      egresos: [],
      dialog: false,
      cargando: false,
      guardando: false,
      getError: false,
      headers: [
        { text: "Artículo", value: "nombreArticulo" },
        { text: "Fecha Egreso", value: "fecha"},
        { text: "Nro. Edición", value: "nroEdicion"},
        { text: "Precio Venta", value: "precioVenta"},
        { text: "Precio Rendición", value: "precioRendicion"},
        { text: "Cantidad Devuelta", value: "cantidad" }
      ],
      /*
      activarDesactivarDialog: {
        titulo: "",
        mensaje: "",
        id: null,
        mostrar: false,
        item: {}
      },*/
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
        .get(`${process.env.VUE_APP_ROOT_API}egresos?Inactivos=true`)
        .then(response => {
          this.egresos = response.data;
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
</style>