<template>
  <div>
    <v-layout align-start>
      <v-flex>
        <v-toolbar flat color="info" dark>
          <v-toolbar-title class="headline font-weight-regular">Movimientos</v-toolbar-title>
          <v-divider class="mx-2" inset vertical></v-divider>
        </v-toolbar>

        <v-card>
          <v-toolbar flat light>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              prepend-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn @click="mostrarFormCaja()" :disabled="cargando || error" flat>Caja</v-btn>
            <v-btn
              :disabled="cargando || error || cargandoReporte || caja.id == null"
              flat
              @click="generarReporte(caja.id)"
            >Reporte</v-btn>
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
                  class="icon"
                  title="ver detalle"
                  @click="$router.push({path: '/caja/rendiciones/' + props.item.id, append: true})"
                >visibility</v-icon>
                <template v-if="props.item.anulable">
                  <v-icon class="icon" @click="mostrarDialogAnular(props.item)" title="anular">block</v-icon>
                </template>
                <template v-else-if="props.item.anulado">
                  <span>ANULADO</span>
                </template>
              </td>
              <td class="text-xs-right">{{ props.item.id }}</td>
              <td>{{ columnDate(props.item.fechaCreacion) }}</td>
              <td>{{ props.item.nombreVendedor }}</td>
              <td class="text-xs-right">{{ columnMoney(props.item.montoTotal) }}</td>
              <td class="text-xs-right">{{ columnMoney(props.item.importeTotal) }}</td>
              <td class="text-xs-right">{{ columnMoney(props.item.saldoTotal) }}</td>
              <!--<td>{{ props.item.nombreUsuarioCreador }}</td>-->
            </template>

            <template slot="no-data">
              <div v-if="cargando" class="text-xs-center">
                <p>Cargando...</p>
              </div>
              <div v-else-if="error" class="text-xs-center">
                <v-alert
                  outline
                  :value="error"
                  transition="scale-transition"
                  type="error"
                >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
                <v-btn color="info" title="recargar" @click="recargar">
                  Reintentar
                  <v-icon small>refresh</v-icon>
                </v-btn>
              </div>
              <div v-else class="text-xs-center">No se encontraron registros</div>
            </template>
          </v-data-table>
        </v-card>

        <!----------------- DIALOG ACTIVAR/DESACTIVAR ----------------->
        <v-dialog v-model="dialogAnular.mostrar" max-width="420">
          <v-card>
            <v-toolbar color="secondary" flat dark dense extense>
              <v-toolbar-title>
                {{dialogAnular.titulo}}
                <v-icon class="mx-2" color="warning">warning</v-icon>
              </v-toolbar-title>
            </v-toolbar>
            <v-card-text>{{dialogAnular.mensaje}}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="error" @click="cerrarDialogAnular()">Cancelar</v-btn>
              <v-btn flat color="info" @click="anular()">Confirmar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!----------------- DIALOG CERRAR CAJA ----------------->
        <v-dialog v-model="dialogCerrarCaja" max-width="420">
          <v-card>
            <v-toolbar color="secondary" flat dark dense extense>
              <v-toolbar-title>
                Cierre de Caja
                <v-icon class="mx-2" color="warning">warning</v-icon>
              </v-toolbar-title>
            </v-toolbar>
            <v-card-text>Desea realizar un cierre de caja?</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn flat color="error" @click="dialogCerrarCaja = false">Cancelar</v-btn>
              <v-btn flat color="info" :loading="guardandoCaja" @click="guardarCaja()">Confirmar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!--------------------- DIALOG/FORM CAJA ----------------------------->
        <v-dialog v-model="dialogCaja" max-width="500px">
          <v-card>
            <v-toolbar color="secondary" flat dark dense extense>
              <v-toolbar-title>{{this.caja.id == null ?"Apertura de Caja":"Resumen de Caja"}}</v-toolbar-title>
            </v-toolbar>
            <div v-if="cargandoCaja" class="text-xs-center" style="padding:50px">
              <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
            </div>
            <div v-else-if="errorCaja" class="text-xs-center" style="padding:50px">
              <v-alert
                :value="errorCaja"
                transition="scale-transition"
                type="error"
                outline
              >Ocurrió un error al intentar obtener los datos, por favor verifique su conexión e intente nuevamente.</v-alert>
              <v-btn color="info" title="recargar" @click="recargar()">
                Reintentar
                <v-icon small>refresh</v-icon>
              </v-btn>
            </div>
            <div v-else>
              <v-container grid-list-md>
                <v-layout wrap>
                  <template v-if="caja.id == null">
                    <v-flex xs12 md6>
                      <v-text-field readonly label="Cajero" v-model="caja.cajero"></v-text-field>
                    </v-flex>
                    <!--<v-flex xs12 md6>
                      <v-text-field readonly label="Username" v-model="caja.username"></v-text-field>
                    </v-flex>-->
                    <v-flex xs12 md6>
                      <v-text-field
                        autofocus
                        type="number"
                        label="Monto Inicial Gs."
                        v-model="caja.montoInicial"
                        :error-messages="mensajeValidacion['MontoInicial']"
                      ></v-text-field>
                    </v-flex>
                  </template>
                  <template v-else>
                    <v-flex xs6>
                      <v-text-field readonly label="Id. Caja" v-model="caja.id"></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field readonly label="Cajero" v-model="caja.cajero"></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        readonly
                        label="Fecha Apertura"
                        :value="new Date(caja.fechaCreacion).toLocaleDateString()"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        readonly
                        label="Hora Apertura"
                        :value="new Date(caja.fechaCreacion).toLocaleTimeString() + ' Hs'"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        readonly
                        label="Monto Inicial"
                        :value="columnMoney(caja.montoInicial) + ' Gs.'"
                      ></v-text-field>
                    </v-flex>
                    <v-flex xs6>
                      <v-text-field
                        readonly
                        label="Monto Actual"
                        :value="columnMoney(caja.monto) + ' Gs.'"
                      ></v-text-field>
                    </v-flex>
                  </template>
                </v-layout>
              </v-container>
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <template v-if="hayCaja">
                <v-btn
                  flat
                  color="error"
                  :loading="guardandoCaja"
                  :disabled="errorCaja || cargandoCaja"
                  @click="dialogCerrarCaja = true"
                >Cerrar Caja</v-btn>
                <v-btn flat color="info" @click="dialogCaja = false">Ok</v-btn>
              </template>
              <template v-else>
                <v-btn flat color="error" @click="dialogCaja = false">Cancelar</v-btn>
                <v-btn
                  flat
                  color="info"
                  :loading="guardandoCaja"
                  :disabled="errorCaja || cargandoCaja"
                  @click="guardarCaja"
                >Abrir Caja</v-btn>
              </template>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-flex>
      <v-btn
        fixed
        dark
        fab
        bottom
        right
        type="button"
        title="Nuevo"
        color="success"
        :disabled="cargando || error || !caja.id"
        @click="$router.push({name: 'nueva-rendicion', append: true, params: {idCaja: caja.id}})"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-snackbar
        :timeout="1500"
        bottom
        left
        v-model="snackbar.visible"
        :color="snackbar.color"
      >{{snackbar.message}}</v-snackbar>
      <v-snackbar bottom left v-model="cargandoReporte" :color="snackbar.color">
        Descargando reporte
        <v-progress-circular v-show="cargandoReporte" indeterminate></v-progress-circular>
      </v-snackbar>
    </v-layout>
    <a hidden ref="fileAnchor"></a>
  </div>
</template>

<script>
import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default {
  mixins: [columnasMixin, usuarioMixin],
  data() {
    return {
      rendiciones: [],
      cargando: false,
      guardando: false,
      error: false,
      cargandoCaja: false,
      guardandoCaja: false,
      errorCaja: false,
      dialogCaja: false,
      dialogCerrarCaja: false,
      cargandoReporte: false,
      errorReporte: false,
      caja: {
        id: null,
        idUsuarioCreador: null,
        cajero: null,
        username: null,
        montoInicial: null,
        monto: null,
        fechaCreacion: null
      },
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
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
      dialogAnular: {
        titulo: "",
        mensaje: "",
        id: null,
        mostrar: false,
        item: {}
      },
      search: "",
      mensajeValidacion: [],
      snackbar: {
        visible: false,
        message: null,
        color: "info",
        timeout: null
      }
    };
  },
  methods: {
    getRegistros() {
      let idCajero = this.getUserId();
      this.caja.cajero = this.getUserFullName();
      this.cargandoCaja = true;
      this.cargando = true;
      this.errorCaja = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}cajas/cajero/${idCajero}`)
        .then(response => {
          this.caja = response.data;
          this.cargandoCaja = false;
          this.errorCaja = false;
          this.listar();
        })
        .catch(error => {
          if (!error.response) {
            this.errorCaja = true;
          }
          this.rendiciones = [];
          this.cargandoCaja = false;
          this.cargando = false;
        });
    },
    listar() {
      if (this.caja.id) {
        this.cargando = true;
        this.$http
          .get(
            `${process.env.VUE_APP_ROOT_API}rendiciones/caja/${this.caja.id}`
          )
          .then(response => {
            this.rendiciones = response.data;
            this.cargando = false;
            this.error = false;
          })
          .catch(error => {
            console.log(error);
            this.cargando = false;
            this.error = true;
          });
      }
    },
    getCaja() {
      let idCajero = this.getUserId();
      this.caja.cajero = this.getUserFullName();
      this.cargandoCaja = true;
      this.errorCaja = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}cajas/cajero/${idCajero}`)
        .then(response => {
          this.caja = response.data;
          this.cargandoCaja = false;
          this.errorCaja = false;
        })
        .catch(error => {
          if (!error.response) {
            this.errorCaja = true;
          }
          this.cargandoCaja = false;
        });
    },
    guardarCaja() {
      this.guardandoCaja = true;
      if (this.caja.id == null) {
        // abrir caja
        this.caja.idUsuarioCreador = this.getUserId();
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}cajas`, this.caja)
          .then(response => {
            this.guardandoCaja = false;
            this.getCaja();
          })
          .catch(error => {
            this.guardandoCaja = false;
            this.mensajeValidacion = error.response.data.errors;
          });
      } else {
        // cerrar caja
        let idCaja = this.caja.id;
        this.$http
          .put(`${process.env.VUE_APP_ROOT_API}cajas/desactivar/${idCaja}`)
          .then(response => {
            this.guardandoCaja = false;
            this.caja.id = null;
            this.caja.montoInicial = null;
            this.caja.monto = null;
            this.caja.fechaCreacion = null;
            this.caja.fechaCierre = null;
            this.dialogCaja = false;
            this.dialogCerrarCaja = false;
            this.generarReporte(idCaja);
            this.recargar();
          })
          .catch(error => {
            this.guardandoCaja = false;
          });
      }
    },
    generarReporte(idCaja) {
      this.cargandoReporte = true;
      this.errorReporte = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}cajas/reporte/${idCaja}`, {
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
    getUserFullName() {
      let userId = this.getUserId();
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}usuarios/${userId}?Inactivo=true`)
        .then(response => {
          this.caja.cajero = response.data.nombreCompleto;
          this.caja.username = response.data.username;
        });
    },
    mostrarFormCaja() {
      this.getCaja();
      this.dialogCaja = true;
    },
    mostrarDialogAnular(item) {
      if (item.activo) {
        this.dialogAnular.titulo = "Anular rendición";
        this.dialogAnular.mensaje =
          "Está seguro que desea anular la rendición nro. " + item.id + " ?";
      }
      this.dialogAnular.item = item;
      this.dialogAnular.mostrar = true;
    },
    cerrarDialogAnular() {
      this.dialogAnular.mostrar = false;
    },
    anular() {
      this.$http
        .put(
          `${process.env.VUE_APP_ROOT_API}rendiciones/${
            this.dialogAnular.item.activo ? "desactivar" : "activar"
          }/${this.dialogAnular.item.id}`
        )
        .then(() => {
          this.cerrarDialogAnular();
          this.listar();
        })
        .catch(error => {
          console.log(error);
          this.snackbar.color = "error";
          this.snackbar.message = "Ocurrió un error, revise su conexión.";
          this.snackbar.visible = true;
          this.cerrarDialogAnular();
        });
    },
    recargar() {
      this.getRegistros();
    }
  },
  computed: {
    hayCaja() {
      return this.caja.id;
    }
  },
  watch: {},
  created() {
    this.getRegistros();
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