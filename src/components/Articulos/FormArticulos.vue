<template>
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
              <v-layout wrap row>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    class="mx-3"
                    v-model="articulo.descripcion"
                    label="Artículo"
                    :error-messages="mensajeValidacion['Descripcion']"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-text-field
                    class="mx-3"
                    v-model="articulo.codigo"
                    label="Código"
                    :error-messages="mensajeValidacion['Codigo']"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    v-model="articulo.idCategoria"
                    :items="categorias"
                    item-text="descripcion"
                    item-value="id"
                    label="Categoría"
                    :loading="cargando"
                    :error-messages="mensajeValidacion['IdCategoria']"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm12 md6>
                  <v-select
                    class="mx-3"
                    v-model="articulo.idProveedor"
                    :items="proveedores"
                    item-text="razonSocial"
                    item-value="id"
                    label="Proveedor"
                    :loading="cargando"
                    :error-messages="mensajeValidacion['IdProveedor']"
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-card-text>
          </v-card>
          <v-card>
            <v-card-text>
              <v-layout row wrap class="mx-3">
                <v-flex>
                  <v-toolbar flat color="white">
                    <h3 style="display:inline">Lista de Precios</h3>
                    <v-divider class="mx-3" inset vertical></v-divider>
                    <v-btn color="info" depressed flat dark @click="agregarPrecio">Agregar</v-btn>
                  </v-toolbar>
                  <v-data-table :headers="headers" :items="articulo.precios" :loading="cargando">
                    <template slot="items" slot-scope="props">
                      <td class="justify-center layout px-0">
                        <v-icon @click="eliminarPrecio(props.item)" class="icon">delete</v-icon>
                      </td>
                      <td>
                        <v-text-field
                          autofocus
                          :readonly="props.item.id != null"
                          v-model="props.item.descripcion"
                          :error-messages="mensajeValidacion[`Precios[${props.item.index}].Descripcion`]"
                        ></v-text-field>
                      </td>
                      <td>
                        <v-text-field
                          type="number"
                          v-model="props.item.precioVenta"
                          :readonly="props.item.id != null"
                          :error-messages="mensajeValidacion[`Precios[${props.item.index}].PrecioVenta`]"
                        ></v-text-field>
                      </td>
                      <td>
                        <v-text-field
                          type="number"
                          v-model="props.item.precioRendVendedor"
                          :readonly="props.item.id != null"
                          :error-messages="mensajeValidacion[`Precios[${props.item.index}].PrecioRendVendedor`]"
                        ></v-text-field>
                      </td>
                    </template>
                    <template slot="no-data">
                      <div class="text-xs-center" v-if="!mensajeValidacion.hasOwnProperty('Precios')">No hay precios</div>
                      <div class="text-xs-center" v-else><v-icon class="mx-2">error</v-icon>Debe ingresar al menos un precio de venta y rendición.</div>
                    </template>
                  </v-data-table>
                </v-flex>
              </v-layout>
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
  name: "FormArticulos",
  props: {
    id: {
      type: Number,
      default: null,
      required: false
    }
  },
  data() {
    return {
      articulo: {
        id: null,
        descripcion: null,
        codigo: null,
        idCategoria: null,
        idProveedor: null,
        activo: true,
        precios: []
      },
      categorias: [],
      proveedores: [],
      headers: [
        { text: "Eliminar", sortable: false, width: "15%" },
        { text: "Descripción", value: "descripcion", sortable: false },
        {
          text: "Precio Venta",
          value: "precioVenta",
          sortable: false,
          width: "15%"
        },
        {
          text: "Precio Rendición",
          value: "precioRendVendedor",
          sortable: false,
          width: "15%"
        }
      ],
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
      this.getArticulo();
    }
    this.getProveedores();
    this.getCategorias();
  },
  methods: {
    getArticulo() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(
          `${process.env.VUE_APP_ROOT_API}articulos/${this.id}?Inactivo=true`
        )
        .then(response => {
          this.articulo = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getCategorias() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}categorias/`)
        .then(response => {
          this.categorias = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    getProveedores() {
      this.cargando = true;
      this.getError = false;
      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}proveedores/`)
        .then(response => {
          this.proveedores = response.data;
          this.cargando = false;
        })
        .catch(error => {
          console.log(error);
          this.cargando = false;
          this.getError = true;
        });
    },
    agregarPrecio() {
      this.articulo.precios.push({
        id: null,
        descripcion: null,
        precioVenta: null,
        precioRendVendedor: null,
        index: this.articulo.precios.length + 1 - 1
      });
    },
    eliminarPrecio(item) {
      this.articulo.precios = this.articulo.precios.filter(
        p => p.id != item.id || p.index != item.index
      );
    },
    guardar() {
      this.guardando = true;
      if (this.articulo.id) {
        // Editar
        this.$http
          .put(
            `${process.env.VUE_APP_ROOT_API}articulos/${this.articulo.id}`,
            this.articulo
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
        this.$http
          .post(`${process.env.VUE_APP_ROOT_API}articulos`, this.articulo)
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
    },
    recargar() {
      if (this.id) {
        this.getArticulo();
      }
      this.getProveedores();
      this.getCategorias();
    }
  },
  computed: {
    formTitle() {
      return !this.id ? "Nuevo artículo" : "Actualizar artículo";
    }
  }
};
</script>

<style scoped>
</style>