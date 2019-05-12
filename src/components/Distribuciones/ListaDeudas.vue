<template>
<div>
  <v-layout align-start>
    <v-flex>
      <v-card>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Deudas</v-toolbar-title>
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
          :items="distribuciones"
          class="elevation-1"
          :search="search"
          :loading="cargando"
          :disable-initial-sort="true"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.nombreVendedor }}</td>
            <td>{{props.item.nombreArticulo}}</td>
            <td
                class="text-xs-center"
            >{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
            <td class="text-xs-right">{{ props.item.cantidad }}</td>
            <td class="text-xs-right">{{ props.item.devoluciones }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.monto) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.importe) }}</td>
            <td class="text-xs-right">{{ columnMoney(props.item.saldo) }}</td>
            
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
              <v-btn color="info" title="recargar" @click="getDeudas()">Reintentar
                <v-icon small>refresh</v-icon>
              </v-btn>
            </div>
            <div v-else class="text-xs-center">No se encontraron registros</div>
          </template>
        </v-data-table>
        <v-btn
            v-if="!modoCarga"
            fixed
            dark
            fab
            bottom
            right
            type="button"
            title="Reporte"
            color="secondary"
            @click="generarReporte()"
            :loading="cargandoReporte"
            :disabled="cargando || error || cargandoReporte"
          >
            <v-icon>print</v-icon>
          </v-btn>
      </v-card>
    </v-flex>
    <v-snackbar
        :timeout="1500"
        bottom
        left
        v-model="snackbar.visible"
        :color="snackbar.color">
      {{snackbar.message}}
      <v-icon class="ml-2">{{snackbar.icon}}</v-icon>
      </v-snackbar>
      
      <v-snackbar bottom left v-model="cargandoReporte" :color="snackbar.color">
        Descargando Reporte
        <v-progress-circular v-show="cargandoReporte" indeterminate></v-progress-circular>
      </v-snackbar>
  </v-layout>
  <a hidden ref="fileAnchor"></a>
</div>
</template>

<script>
import usuarioMixin from "../../mixins/columnasMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  mixins: [columnasMixin],
  data() {
    return {
      cargandoReporte: false,
      errorReporte: false,
      error: false,
      distribuciones: [],
      vendedores: [],
      dialog: false,
      cargando: false,
      guardando: false,
      modoCarga: false,
      getError: false,
      headers: [
        { text: "Vendedor", value: "nombreVendedor", sortable: false, },
        { text: "Nombre del artículo", value: "nombreArticulo" },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false },
        { text: "Devoluciones", value: "", sortable: false },
        { text: "Monto", value: "", sortable: false },
        { text: "Importe", value: "", sortable: false },
        { text: "Saldo", value: "", sortable: false }    
      ],
      search: "",
      snackbar: {
        visible: false,
        message: null,
        color: "info"
      }
    };
  },
  methods: {
    getDeudas() {
      this.cargando = true;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}distribuciones/detalle/deudas`)
        .then(response => {
          this.distribuciones = response.data;
          this.cargando = false;
          this.getError = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    generarReporte(fechas) {
      this.cargandoReporte = true;
      this.errorReporte = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}distribuciones/reporte/deudas`,
           {
          responseType: "blob"
        })
        .then(r => {
          // obtenemos el nombre del archivo
          this.$refs.fileAnchor.download = r.headers["content-disposition"]
            .split(";")
            .find(cd => cd.includes("filename"))
            .split("=")[1]
            .split('"')
            .join(""); //para quitar el caracter "*/

          // obtenemos el archivo
          return new Blob([r.data], {
            type: "application/pdf"
          });
        })
        .then(
          blob => {
            const anchor = this.$refs.fileAnchor;
            anchor.href = URL.createObjectURL(blob);
            anchor.click();
            this.cargandoReporte = false;
            this.errorReporte = false;
          },
          err => {
            console.log(err);
            this.snackbar.color = "error";
            this.snackbar.message =
              "Ocurrió un error, no se pudo descargar el documento";
            this.snackbar.visible = true;
            this.cargandoReporte = false;
            this.errorReporte = true;
          }
        );
    },
  },
  computed: {},
  watch: {},
  created() {
    this.getDeudas();
    this.modoCarga = false;
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