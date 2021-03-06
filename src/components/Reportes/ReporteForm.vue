<template>
  <div>
    <v-layout>
      <v-flex>
        <v-card>
          <v-toolbar color="info" dark>
            <v-toolbar-title class="headline font-weight-regular">Reporte de Ventas</v-toolbar-title>
            <v-divider class="mx-2" inset vertical></v-divider>
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
            <!-- FORMULARIO DE REPORTE -->
            <v-card>
              <v-card-text>
                <v-form v-model="valid" ref="form">
                  <v-layout wrap row>
                    <!---poner fecha-->
                    <v-flex xs12 sm12 md6>
                      <v-text-field
                        class="mx-3"
                        :disabled="modoEdicion"
                        type="date"
                        label="Fecha Desde"
                        v-model="fechas.fechaInicio"
                        :error-messages="mensajesValidacion['FechaInicio']"
                        required
                        :rules="[
                        (v) => fechas.fechaInicio != null || 'es requerido']"
                        prepend-icon="calendar_today"
                      ></v-text-field>
                    </v-flex>

                    <v-flex xs12 sm12 md6>
                      <v-text-field
                        class="mx-3"
                        :disabled="modoEdicion"
                        type="date"
                        label="Fecha Hasta"
                        v-model="fechas.fechaFin"
                        :error-messages="mensajesValidacion['FechaFin']"
                        :rules="[
                        (v) => fechas.fechaFin != null || 'es requerido',
                        (v) => fechas.fechaFin >= fechas.fechaInicio || 'Debe ser mayor o igual a Fecha Desde']"
                        prepend-icon="calendar_today"
                        required
                      ></v-text-field>
                    </v-flex>

                    <v-flex xs12 sm12 md6>
                      <v-select
                        class="mx-3"
                        :disabled="modoEdicion"
                        :items="TipoReportes"
                        item-text="desc"
                        item-value="valor"
                        label="Tipo Reporte"
                        v-model="fechas.reporte"
                        required
                        :error-messages="mensajesValidacion['Tipo']"
                        :rules="[(v) => fechas.reporte != null || 'es requerido']"
                        prepend-icon="bar_chart"
                      ></v-select>
                    </v-flex>
                  </v-layout>
                </v-form>
              </v-card-text>
            </v-card>

            <v-btn
              fixed
              dark
              fab
              bottom
              right
              type="button"
              title="Reporte"
              color="secondary"
              @click="generarReporte(fechas)"
              :loading="cargandoReporte"
              :disabled="cargando || error || cargandoReporte"
            >
              <v-icon>print</v-icon>
            </v-btn>
          </template>
        </v-card>
      </v-flex>

      <v-snackbar :timeout="1500" bottom left v-model="snackbar.visible" :color="snackbar.color">
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
import { validationMixin } from "vuelidate";
import { required, between } from "vuelidate/lib/validators";
import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default {
  name: "ReporteForm",
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
      cargandoReporte: false,
      errorReporte: false,
      error: false,
      mensajesValidacion: [],
      fechas: {
        fechaInicio: null,
        fechaFin: null,
        reporte: null
      },
      TipoReportes: [
        { desc: "Reporte de Ventas Diarias", valor: "Diarias" },
        { desc: "Reporte de Ventas por Vendedor", valor: "Vendedores" },
        { desc: "Reporte de Ventas por Artículos", valor: "Articulos" }
      ],
      cargando: false,
      guardando: false,
      getError: false,
      modoLectura: false,
      modoEdicion: false,
      modoCarga: false,
      dialog: false,
      busqueda: null,
      valid: false,
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        icon: "info",
        timeout: null
      }
    };
  },

  created() {
    this.modoLectura = true;
    this.modoCarga = false;
    this.toggle_exclusive = 0;
  },
  methods: {
    generarReporte(fechas) {
      if (this.$refs.form.validate()) {
        this.cargandoReporte = true;
        this.errorReporte = false;
        this.$http
          .get(
            `${
              process.env.VUE_APP_ROOT_API
            }distribuciones/reporte/ventas?fechaInicio=${
              fechas.fechaInicio
            }&fechaFin=${fechas.fechaFin}&tipo=${fechas.reporte}`,
            {
              responseType: "blob"
            }
          )
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
              console.log(err.response);
              this.snackbar.color = "error";
              this.snackbar.message =
                "Ocurrió un error, no se pudo descargar el documento";
              this.snackbar.visible = true;
              this.cargandoReporte = false;
              this.errorReporte = true;
            }
          );
      }
    },

    recargar() {
      this.modoLectura = true;
      this.modoCarga = false;
      this.toggle_exclusive = 0;
    }
  },
  computed: {},
  watch: {}
};
</script>
<style scoped>
.scrollable {
  max-height: 350px;
  overflow-y: auto;
}
.style-input input {
  text-align: right;
  font-size: 0.7em;
}
.scrollable-list {
  /*max-height: 400px;*/
  height: 300px;
  overflow-y: auto;
}
</style>
