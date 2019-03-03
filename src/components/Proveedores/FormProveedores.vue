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
                      v-model="proveedor.razonSocial"
                      label="Razón Social"
                      :error-messages="mensajeValidacion['RazonSocial']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="proveedor.numeroDocumento"
                      label="RUC"
                      :error-messages="mensajeValidacion['NumeroDocumento']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="proveedor.direccion"
                      label="Dirección"
                      :error-messages="mensajeValidacion['Direccion']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="proveedor.telefono"
                      label="Teléfono"
                      :error-messages="mensajeValidacion['Telefono']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="proveedor.email"
                      label="Email"
                      :error-messages="mensajeValidacion['Email']"
                    ></v-text-field>
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
  name: "FormProveedores",
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      proveedor: {
        id: null,
        razonSocial: null,
        numeroDocumento: null,
        direccion: null,
        telefono: null,
        email: null,
        activo: true
      },
      cargando: false,
      guardando: false,
      getError: false,
      mensajeValidacion: [],
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
      this.getProveedor();
    }
  },
  methods: {
    getProveedor() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}proveedores/${this.id}?Inactivo=true`
        )
        .then(response => {
          this.proveedor = response.data;
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
      if (this.proveedor.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}proveedores/${this.proveedor.id}`,
            this.proveedor
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
          .post(`${process.env.VUE_APP_ROOT_API}proveedores`, this.proveedor)
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
        this.getProveedor();
      }
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Nuevo Proveedor" : "Actualizar Proveedor";
    }
  }
};
</script>

<style scoped>
</style>