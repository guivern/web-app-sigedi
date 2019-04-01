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
            <td>{{ columnDateWithoutTime(props.item.fecha) }}</td>
            <td>{{ props.item.nombreArticulo }}</td>
            <td>{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
            <td>{{ props.item.nroEdicion }}</td>
            <td>{{ props.item.cantidad }}</td>
            <td>{{ props.item.nombreUsuario }}</td>
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
        { text: "Fecha Egreso", value: "fecha"},
        { text: "Artículo", value: "nombreArticulo" },
        { text: "Fecha Edicion", value: "fechaEdicion"},
        { text: "Nro. Edición", value: "nroEdicion"},
        { text: "Devoluciones", value: "cantidad" },
        { text: "Usuario", value: "NombreUsuario"}
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