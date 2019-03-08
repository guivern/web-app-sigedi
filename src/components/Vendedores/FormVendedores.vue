<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-toolbar color="info" dark flat>
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
          <v-card>
            <v-card-text v-on:keyup.enter="guardar">
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.nombre"
                      label="Nombres"
                      :error-messages="mensajeValidacion['Nombre']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.apellido"
                      label="Apellidos"
                      :error-messages="mensajeValidacion['Apellido']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.nacionalidad"
                      label="Nacionalidad"
                      :error-messages="mensajeValidacion['Nacionalidad']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-select
                      class="mx-3"
                      v-model="vendedor.tipoDocumento"
                      :items="items"
                      label="Tipo de Documento"
                      :loading="cargando"
                      :error-messages="mensajeValidacion['TipoDocumento']"
                    ></v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.numeroDocumento"
                      label="Nro. Documento"
                      :error-messages="mensajeValidacion['NumeroDocumento']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-menu
                      ref="menuFecha"
                      v-model="menuFecha"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        class="mx-3"
                        slot="activator"
                        v-model="fechaFormateada"
                        label="Fecha Nacimiento"
                        hint="DD/MM/AAAA"
                        persistent-hint
                        @blur="vendedor.fechaNacimiento = parseDate(fechaFormateada)"
                        :error-messages="mensajeValidacion['FechaNacimiento']"
                      ></v-text-field>
                      <v-date-picker
                        v-model="vendedor.fechaNacimiento"
                        no-title
                        locale="es-419"
                        @input="menuFecha = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.direccion"
                      label="Dirección"
                      :error-messages="mensajeValidacion['Direccion']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      type="number"
                      class="mx-3"
                      v-model="vendedor.telefono"
                      label="Teléfono"
                      :error-messages="mensajeValidacion['Telefono']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      type="number"
                      class="mx-3"
                      v-model="vendedor.telefonoMovil"
                      label="Teléfono Móvil"
                      :error-messages="mensajeValidacion['TelefonoMovil']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.email"
                      label="Email"
                      :error-messages="mensajeValidacion['Email']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-menu
                      ref="menuFechaIngreso"
                      v-model="menuFechaIngreso"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        class="mx-3"
                        slot="activator"
                        v-model="fechaFormateadaIngreso"
                        label="Fecha Ingreso"
                        hint="DD/MM/AAAA"
                        persistent-hint
                        @blur="vendedor.fechaIngreso = parseDate(fechaFormateadaIngreso)"
                        :error-messages="mensajeValidacion['FechaIngreso']"
                      ></v-text-field>
                      <v-date-picker
                        v-model="vendedor.fechaIngreso"
                        no-title
                        locale="es-419"
                        @input="menuFechaIngreso = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="vendedor.zonaVenta"
                      label="Zona de Venta"
                      :error-messages="mensajeValidacion['ZonaVenta']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    
                    <v-textarea
                      v-model="vendedor.descripcion"
                      box
                      label="Observaciones"
                      :error-messages="mensajeValidacion['Observaciones']"
                      rows="1"
                      auto-grow
                    ></v-textarea>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-card>
          <v-btn
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
export default {
  name: "FormUsuario",
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      vendedor: {
        id: null,
        nombre: null,
        apellido: null,
        fechaNacimiento: null,
        tipoDocumento: null,
        numeroDocumento: null,
        telefono: null,
        direccion: null,
        zonaVenta: null,
        nacionalidad: null,
        email: null,
        telefonoMovil: null,
        fechaIngreso: null,
        descripcion: null,
        tipoDocumento: null,
        activo: true
      },
      items: ['Cédula', 'Pasaporte', 'RUC'],
      cargando: false,
      guardando: false,
      getError: false,
      mensajeValidacion: [],
      fechaFormateada: null,
      fechaFormateadaIngreso: null,
      menuFecha: false,
      menuFechaIngreso: false,
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
      this.getVendedor();
      this.fechaFormateada = this.formatDate(this.vendedor.fechaNacimiento);
      this.fechaFormateadaIngreso = this.formatDate(this.vendedor.fechaIngreso);
    }
  },
  methods: {
    getVendedor() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}vendedores/${this.id}?Inactivo=true`
        )
        .then(response => {
          this.vendedor = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    guardar() {
      this.guardando = true;
      if (this.vendedor.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}vendedores/${this.vendedor.id}`,
            this.vendedor
          )
          .then(response => {
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Actualización exitosa";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push(".");
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
                  this.mensajeValidacion = 
                  error.response.data.errors? error.response.data.errors: error.response.data;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.icon = "error";
              this.snackbar.visible = true;
            }
          });
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}vendedores`, this.vendedor)
          .then(response => {
            this.guardando = false;
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Registro exitoso";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push(".");
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
                  this.mensajeValidacion = 
                  error.response.data.errors? error.response.data.errors: error.response.data;
            } else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.icon = "error";
              this.snackbar.visible = true;
            }
          });
      }
    },
    recargar() {
      if (this.id) {
        this.getVendedor();
      }
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.substr(0, 10).split("-");
      return `${day}/${month}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Nuevo vendedor" : "Actualizar vendedor";
    },
    fechaNacimiento() {
      return this.vendedor.fechaNacimiento;
    },
    fechaIngreso() {
      return this.vendedor.fechaIngreso;
    }
  },
  watch: {
    fechaNacimiento() {
      this.fechaFormateada = this.vendedor.fechaNacimiento
        ? this.formatDate(this.vendedor.fechaNacimiento)
        : null;
      //console.log(this.fechaFormateada);
      this.$emit("input", this.vendedor.fechaNacimiento);
    },
    fechaIngreso() {
      this.fechaFormateadaIngreso = this.vendedor.fechaIngreso
        ? this.formatDate(this.vendedor.fechaIngreso)
        : null;
      //console.log(this.fechaFormateada);
      this.$emit("input", this.vendedor.fechaIngreso);
    }
  }
};
</script>

<style scoped>
</style>