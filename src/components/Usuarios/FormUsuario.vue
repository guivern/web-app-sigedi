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
                      v-model="usuario.username"
                      label="Username"
                      :error-messages="mensajeValidacion['Username']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-select
                      class="mx-3"
                      v-model="usuario.idRol"
                      :items="roles"
                      item-text="nombre"
                      item-value="id"
                      label="Perfil"
                      :loading="cargando"
                      :error-messages="mensajeValidacion['IdRol']"
                    ></v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="usuario.nombre"
                      label="Nombres"
                      :error-messages="mensajeValidacion['Nombre']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      v-model="usuario.apellido"
                      label="Apellidos"
                      :error-messages="mensajeValidacion['Apellido']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      type="password"
                      prepend-icon="lock"
                      v-model="usuario.password1"
                      label="Password"
                      :error-messages="mensajeValidacion['Password1']"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md6>
                    <v-text-field
                      class="mx-3"
                      prepend-icon="lock"
                      type="password"
                      v-model="usuario.password2"
                      label="Confirmar password"
                      :error-messages="mensajeValidacion['Password2']"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
                <v-alert
                  v-show="matchError"
                  outline
                  transition="scale-transition"
                  type="error"
                >Los passwords no coinciden</v-alert>
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
      usuario: {
        id: null,
        nombre: null,
        apellido: null,
        idRol: null,
        password1: null,
        password2: null,
        activo: true
      },
      roles: [],
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
      this.getUsuario();
    }
    this.getRoles();
  },
  methods: {
    getUsuario() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}usuarios/${this.id}?Inactivo=true`)
        .then(response => {
          this.usuario = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getRoles() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}roles`)
        .then(response => {
          this.roles = response.data;
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
      if (this.usuario.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}usuarios/${this.usuario.id}`,
            this.usuario
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
              } else if (error.response.data.usernameError) {
                this.mensajeValidacion = {
                  Username: error.response.data.usernameError
                };
              } else if (error.response.data.password1Error) {
                this.mensajeValidacion = {
                  Password1: error.response.data.password1Error
                };
              } else if (error.response.data.password2Error) {
                this.mensajeValidacion = {
                  Password2: error.response.data.password2Error
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
      } else {
        // Guardar
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}usuarios`, this.usuario)
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
              } else if (error.response.data.usernameError) {
                this.mensajeValidacion = {
                  Username: error.response.data.usernameError
                };
              } else if (error.response.data.password1Error) {
                this.mensajeValidacion = {
                  Password1: error.response.data.password1Error
                };
              } else if (error.response.data.password2Error) {
                this.mensajeValidacion = {
                  Password2: error.response.data.password2Error
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
        this.getUsuario();
      }
      this.getRoles();
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Nuevo usuario" : "Actualizar usuario";
    }
  }
};
</script>

<style scoped>
</style>