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
                      v-model="categoria.descripcion"
                      label="Descripción"
                      :error-messages="mensajeValidacion['Descripcion']"
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
  name: "FormCategoria",
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      categoria: {
        id: null,
        descripcion: null,
        activo: true
      },
      cargando: false,
      guardando: false,
      getError: false,
      matchError: false,
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
      this.getCategoria();
    }
  },
  methods: {
    getCategoria() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}categorias/${this.id}?Inactivo=true`)
        .then(response => {
          this.categoria = response.data;
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
      if (this.categoria.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}categorias/${this.categoria.id}`,
            this.categoria
          )
          .then(response => {
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Actualización exitosa";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push('.');
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              if (error.response.data.errors) {
                this.mensajeValidacion = error.response.data.errors;
              } else if (error.response.data.descripcionError) {
                this.mensajeValidacion = {
                  Descripcion: error.response.data.descripcionError
                };
              }
              
              } else if (error.response.data.matchError) {
                this.matchError = true;
              }
              else {
              this.snackbar.color = "error";
              this.snackbar.message = "Ocurrió un error, revise su conexión.";
              this.snackbar.icon = "error";
              this.snackbar.visible = true;
            }
          });
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}categorias`, this.categoria)
          .then(response => {
            this.guardando = false;
            this.guardando = false;
            this.snackbar.color = "info";
            this.snackbar.message = "Registro exitoso";
            this.snackbar.icon = "check_circle";
            this.snackbar.visible = true;
            setTimeout(() => {
              this.$router.push('.');
            }, 2000);
          })
          .catch(error => {
            this.guardando = false;
            if (error.response) {
              if (error.response.data.errors) {
                this.mensajeValidacion = error.response.data.errors;
              } else if (error.response.data.descripcionError) {
                this.mensajeValidacion = {
                  Descripcion: error.response.data.descripcionError
                };
              } else if (error.response.data.matchError) {
                this.matchError = true;
              }
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
        this.getCategoria();
      }
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Nueva Categoría" : "Actualizar categoría";
    }
  }
};
</script>

<style scoped>
</style>