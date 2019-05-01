<template>
<div>
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
          
          <v-btn-toggle v-if="!modoCarga" v-model="toggle_exclusive" light>
          <v-btn 
                :disabled="cargando || error || cargandoReporte || rendicion.id == null"
                flat @click="generarReporte(rendicion.id)">
              <v-icon>print</v-icon>
            </v-btn>
          </v-btn-toggle>
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
            <v-card-text>
              <v-layout wrap row>
                <v-flex xs12 sm12 md4>
                  <v-text-field
                    class="mx-3"
                    label="Nro. Documento"
                    :readonly="modoLectura"
                    v-model="nroDocumento"
                    :prepend-icon="modoLectura? 'subtitles' : 'search'"
                  ></v-text-field>
                </v-flex>
                
                <v-flex xs12 sm12 md5>
                  <v-autocomplete
                    class="mx-3"
                    :readonly="modoLectura"
                    v-model="rendicion.idVendedor"
                    :items="vendedores"
                    item-text="nombreCompleto"
                    item-value="id"
                    hide-no-data
                    hide-selected
                    label="Vendedor"
                    placeholder="Ingrese el vendedor"
                    :loading="cargando"
                    required
                    prepend-icon="person"
                    @input="$v.rendicion.idVendedor.$touch()"
                    @blur="$v.rendicion.idVendedor.$touch()"
                    :error-messages="mensajeValidacion['IdVendedor'] || vendedorError"
                  ></v-autocomplete>
                </v-flex>
              </v-layout>
              <v-container grid-list-xl fluid>
                <v-layout wrap row>
                  <v-flex xs4 md3>
                    <v-text-field
                      outline
                      readonly
                      label="Total Rendición Gs."
                      :value="columnMoney(rendicion.montoTotal)"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs4 md3>
                    <v-text-field
                      outline
                      readonly
                      label="Total Importe Gs."
                      :value="columnMoney(rendicion.importeTotal)"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs4 md3>
                    <v-text-field
                      outline
                      readonly
                      label="Total Saldo Gs."
                      :value="columnMoney(rendicion.saldoTotal)"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
          <!-- LISTA/FORM DETALLE -->
          <v-card>
            <v-card-text v-on:keyup.enter="guardar">
              <v-form v-model="valid" ref="form">
                <v-layout row wrap>
                  <v-flex>
                    <v-toolbar flat color="white">
                      <span style="display:inline" class="title">Detalle</span>
                      <v-divider class="mx-3" inset vertical></v-divider>
                      <v-btn
                        v-if="modoCarga"
                        :outline="!activarDetalle"
                        color="info"
                        dark
                        @click="mostrarBuscador"
                      >Deudas
                      <v-icon class="ml-1" small>launch</v-icon>
                      </v-btn>
                    </v-toolbar>
                    <v-data-table
                      class="scrollable"
                      :headers="headers"
                      :items="rendicion.detalle"
                      :loading="cargando"
                      hide-actions
                    >
                      <template slot="items" slot-scope="props">
                        <td>
                          <v-icon v-if="modoCarga" @click="quitarDetalle(props.item)">delete</v-icon>
                        </td>
                        <td>{{props.item.nombreArticulo}}</td>
                        <td>{{columnDateWithoutTime(props.item.fechaEdicion)}}</td>
                        <td class="text-xs-right" >{{columnMoney(props.item.precioRendicion)}}</td>
                        <td class="text-xs-right">{{props.item.cantidad}}</td>
                        <td class="text-xs-right">
                          <template v-if="modoCarga">
                            <v-text-field
                              class="style-input"
                              type="number"
                              v-model="props.item.devoluciones"
                              @input="calcularSubTotal(props.item)"
                              required
                              :disabled="props.item.yaSeDevolvio"
                              :rules="[
                            (v) => props.item.devoluciones <= props.item.cantidad || `llevó ${props.item.cantidad} artículos`,
                            (v) => props.item.devoluciones >= 0 || 'debe ser positivo',
                            (v) => props.item.devoluciones != null || 'es requerido']"
                            ></v-text-field>
                          </template>
                          <template v-else>{{props.item.devoluciones}}</template>
                        </td>
                        <td class="text-xs-right">{{columnMoney(props.item.monto)}}</td>
                        <td class="text-xs-right">
                          <template v-if="modoCarga">
                            <v-text-field
                              class="style-input"
                              type="number"
                              v-model="props.item.importe"
                              required
                              :rules="[
                            (v) => props.item.importe <= props.item.monto || 'excede el monto',
                            (v) => props.item.importe >= 0 || 'debe ser positivo',
                            (v) => props.item.importe != null || 'es requerido']"
                              @input="calcularSaldo(props.item)"
                            ></v-text-field>
                          </template>
                          <template v-else>{{columnMoney(props.item.importe)}}</template>
                        </td>
                        <td class="text-xs-right">{{columnMoney(props.item.saldo)}}</td>
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
              </v-form>
            </v-card-text>
          </v-card>

          <!-- BUSCADOR DISTRIBUCIONES -->
          <v-dialog v-model="dialog" max-width="850px">
            <v-card>
              <v-toolbar color="secondary" flat dark dense extense>
                <v-toolbar-title>Deudas</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn dark flat @click.native="cerrarBuscador">Cerrar</v-btn>
              </v-toolbar>
              <v-card-text>
                <v-flex xs12>
                  <template>
                    <v-text-field
                      prepend-icon="search"
                      class="text-xs-center"
                      v-model="busqueda"
                      autofocus
                      label="Buscar"
                    ></v-text-field>
                    <v-data-table
                      :headers="headerDistribuciones"
                      :items="distribuciones"
                      :loading="cargandoDistribuciones"
                      :disable-initial-sort="true"
                      :search="busqueda"
                      hide-actions
                      class="scrollable-list"
                    >
                      <template slot="items" slot-scope="props">
                        <td>
                          <v-checkbox
                            v-model="props.item.selected"
                            primary
                            hide-details
                            @change="seleccionDeDistribucion(props.item)"
                          ></v-checkbox>
                        </td>
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
                        <div class="text-xs-center">{{mensaje}}</div>
                      </template>
                    </v-data-table>
                  </template>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-btn
            v-if="modoCarga"
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
    <!--
    <v-snackbar 
      :timeout="1500" bottom v-model="snackbar.visible" :color="snackbar.color">
      {{snackbar.message}}
      <v-icon class="ml-2">{{snackbar.icon}}</v-icon>
    </v-snackbar>
    <v-snackbar bottom left v-model="cargandoReporte" :color="snackbar.color">
        Descargando reporte
        <v-progress-circular v-show="cargandoReporte" indeterminate></v-progress-circular>
      </v-snackbar>
      -->
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
import { validationMixin } from "vuelidate";
import { required, between } from "vuelidate/lib/validators";
import usuarioMixin from "../../mixins/usuarioMixin.js";
import columnasMixin from "../../mixins/columnasMixin.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default {
  name: "FormRendiciones",
  mixins: [usuarioMixin, columnasMixin, validationMixin],
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    },
    idCaja: {
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
      rendicion: {
        id: null,
        idVendedor: null,
        idUsuarioCreador: null,
        idUsuarioModificador: null,
        fechaCreacion: new Date(),
        montoTotal: 0.0,
        importeTotal: 0.0,
        saldoTotal: 0.0,
        detalle: [],
        editable: true,
        anulable: true
      },
      headers: [
        { text: "", value: "opciones", sortable: false, width:"1%" },
        { text: "Nombre del artículo", value: "nombreArticulo", sortable: false },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false, width:"7%" },
        { text: "Prec. Unit.", value: "precioRendicion", sortable: false, width:"7%" },
        { text: "Cantidad", value: "cantidad", sortable: false, width:"7%" },
        { text: "Devoluciones", value: "", sortable: false, width:"7%" },
        { text: "Subtotal", value: "", sortable: false, width:"10%", align: "right" },
        { text: "Importe", value: "", sortable: false, width:"12%", align: "right" },
        { text: "Saldo", value: "", sortable: false, width:"7%", align: "right" }
      ],
      headerDistribuciones: [
        { text: "Rendir", value: "opciones" },
        { text: "Nombre del artículo", value: "nombreArticulo" },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Cantidad", value: "cantidad", sortable: false },
        { text: "Devoluciones", value: "", sortable: false },
        { text: "Monto", value: "", sortable: false },
        { text: "Importe", value: "", sortable: false },
        { text: "Saldo", value: "", sortable: false }
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
      dialog: false,
      cargandoDistribuciones: false,
      errorDistribuciones: false,
      distribuciones: [],
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
  validations: {
    rendicion: {
      idVendedor: { required }
    }
  },
  created() {
    console.log(this.idCaja);
    this.getDatos();
    if (this.id) {
      this.modoLectura = true;
      this.modoCarga = false;
      this.toggle_exclusive = 0;
    } else {
      this.modoCarga = true;
      this.modoLectura = false;
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
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}rendiciones/${this.id}?Inactivo=true`
        )
        .then(response => {
          this.rendicion = response.data;
          this.cargando = false;
          //this.getDistribuciones();
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getDistribuciones() {
      this.cargandoDistribuciones = true;
      this.errorDistribuciones = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}distribuciones/detalle/vendedor/${
            this.idVendedor
          }`
        )
        .then(response => {
          this.distribuciones = response.data;
          this.cargandoDistribuciones = false;
        })
        .catch(error => {
          console.log(error);
          this.cargandoDistribuciones = false;
          this.errorDistribuciones = true;
        });
    },
    calcularSubTotal(detalle) {
      detalle.monto =
        detalle.precioRendicion * (detalle.cantidad - detalle.devoluciones);
      let suma = 0;
      this.rendicion.detalle.forEach(d => {
        suma += parseFloat(d.monto);
      });
      this.rendicion.montoTotal = suma;
      if(detalle.devoluciones == detalle.cantidad){detalle.importe = 0}
      this.calcularSaldo(detalle);
    },
    calcularSaldo(rendicion) {
      rendicion.saldo = rendicion.monto - rendicion.importe;
      let sumaSaldo = 0;
      let sumaImporte = 0;

      this.rendicion.detalle.forEach(d => {
        sumaSaldo += parseFloat(d.saldo);
        sumaImporte += d.importe ? parseFloat(d.importe) : 0;
      });
      this.rendicion.saldoTotal = sumaSaldo;
      this.rendicion.importeTotal = sumaImporte;
    },
    guardar() {
      console.log(this.$refs.form.validate());
      if (this.$refs.form.validate()) {
        this.guardando = true;
        if (this.rendicion.id) {
          // Editar
          this.rendicion.idUsuarioModificador = this.getUserId();
          this.rendicion.idCaja = this.idCaja;
          this.$http
            .put(
              `${process.env.VUE_APP_ROOT_API}rendiciones/${
                this.rendicion.id
              }`,
              this.rendicion
            )
            .then(response => {
              this.guardando = false;
              this.snackbar.color = "info";
              this.snackbar.message = "Registro actualizado";
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
          this.rendicion.idCaja = this.idCaja;
          this.rendicion.idUsuarioCreador = this.getUserId();
          this.rendicion.detalle.forEach(d => (d.id = null));
          this.rendicion.detalle.forEach(d => (d.devoluciones = d.yaSeDevolvio ? 0 : d.devoluciones));
          this.$http
            .post(
              `${process.env.VUE_APP_ROOT_API}rendiciones`,
              this.rendicion
            )
            .then(response => {
              this.guardando = false;
              this.snackbar.color = "info";
              this.snackbar.message = "Registro guardado";
              this.snackbar.icon = "check_circle";
              this.snackbar.visible = true;
              setTimeout(() => {
                this.$router.push({
                  path: "/caja/rendiciones/" + response.data.id
                });
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
      } else {
        this.snackbar.color = "error";
        this.snackbar.message = "Hay errores de validación.";
        this.snackbar.icon = "error";
        this.snackbar.visible = true;
      }
    },
    generarReporte(idRendicion) {
      this.cargandoReporte = true;
      this.errorReporte = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}rendiciones/reporte/${idRendicion}`, {
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
    seleccionDeDistribucion(item) {
      item.idDistribucionDetalle = item.id
        ? item.id
        : item.idDistribucionDetalle;
      if (item.selected) {
        this.agregarDetalle(item);
      } else {
        this.quitarDetalle(item);
      }
    },
    agregarDetalle(item) {
      if (
        !this.rendicion.detalle.some(
          d => d.idDistribucionDetalle == item.idDistribucionDetalle
        )
      ) {
        let detalle = {
          idDistribucionDetalle: item.idDistribucionDetalle,
          cantidad: item.cantidad,
          nombreArticulo: item.nombreArticulo,
          nroEdicion: item.nroEdicion,
          fechaEdicion: item.fechaEdicion,
          precioVenta: item.precioVenta,
          precioRendicion: item.precioRendicion,
          monto: item.saldo,
          importe: null,
          yaSeDevolvio: item.yaSeDevolvio,
          saldo: item.saldo,
          //devoluciones: ,
          id: null,
          anulable: true,
          editable: true
        };

        if(!item.yaSeDevolvio){ detalle.devoluciones = null }
        else{ detalle.devoluciones = item.devoluciones }

        this.rendicion.detalle.push( detalle );
        
        this.rendicion.saldoTotal += item.saldo;
        this.rendicion.montoTotal += item.saldo;
      }
    },
    quitarDetalle(item) {
      //this.rendicion.detalle.forEach(d => this.limpiarDetalle(d));
      this.rendicion.detalle = this.rendicion.detalle.filter(
        d => d.idDistribucionDetalle != item.idDistribucionDetalle
      );
      this.distribuciones.forEach(d => {
        if (d.id == item.idDistribucionDetalle) {
          d.selected = false;
        }
      });
      this.rendicion.montoTotal -= item.monto;
      this.rendicion.saldoTotal -= item.saldo;
      this.rendicion.importeTotal -= item.importe;
    },
    cerrarBuscador() {
      this.busqueda = null;
      this.dialog = false;
    },
    recargar() {
      this.getDatos();
      if (this.id) {
        this.modoLectura = true;
        this.modoCarga = false;
        this.toggle_exclusive = 0;
      } else {
        this.modoCarga = true;
        this.modoLectura = false;
      }
    },
    mostrarBuscador() {
      this.$v.rendicion.idVendedor.$touch();
      if (this.idVendedor != null) {
        this.dialog = true;
        this.$v.$reset();
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
    },
    mensaje() {
      if (this.errorDistribuciones) {
        return "Ocurrió un error al intentar obtener los datos, revise su conexión e intente nuevamente.";
      } else if(this.distribuciones.length == 0){
        return "El vendedor seleccionado no registra deudas";
      }
      else{
        return "Aquí apareceran los las deudas del vendedor."
      }
    }
  },
  watch: {
    idVendedor(newValue, oldValue) {
      if (oldValue != null) {
        this.rendicion.detalle = [];
        this.$refs.form.reset();
      }

      if (this.idVendedor) {
        // obtenemos las distribuciones pendientes del vendedor
        this.activarDetalle = true;
        this.getDistribuciones();
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

