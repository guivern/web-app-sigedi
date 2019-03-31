<template>
  <v-card>
    <v-toolbar color="secondary" flat dark dense extense>
      <v-toolbar-title>Agregar artículos</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn dark flat @click.native="cancelar">Cerrar</v-btn>
    </v-toolbar>
    <v-card-text>
      <v-flex xs12>
        <template>
          <v-text-field
            append-icon="search"
            class="text-xs-center"
            v-model="nombre"
            autofocus
            label="Buscar"
          ></v-text-field>
          <v-data-table
            :headers="header"
            :items="ediciones"
            :loading="cargando"
            :disable-initial-sort="true"
            :search="nombre"
            hide-actions
            class="scrollable-list"
          >
            <template slot="items" slot-scope="props">
              <td>
                <v-checkbox
                  v-model="props.item.selected"
                  @change="agregar(props.item)"
                  :label="props.item.nombreArticulo"
                ></v-checkbox>
              </td>
              <td class="text-xs-center">{{ columnDateWithoutTime(props.item.fechaEdicion) }}</td>
              <td class="text-xs-right">{{ props.item.nroEdicion }}</td>
              <td class="text-xs-right">{{ props.item.cantidadActual }}</td>
            </template>
            <template slot="no-data">
              <div class="text-xs-center">{{mensaje}}</div>
            </template>
          </v-data-table>
        </template>
      </v-flex>
    </v-card-text>
  </v-card>
</template>
<script>
import columnasMixin from "../../mixins/columnasMixin.js";
export default {
  name: "BuscadorEdiciones",
  mixins: [columnasMixin],
  props: ["detalle"],
  data() {
    return {
      header: [
        //{ text: "Seleccionar", value: "seleccionar", sortable: false },
        { text: "Artículo", value: "nombreArticulo" },
        { text: "Fecha Edición", value: "fechaEdicion", sortable: false },
        { text: "Nro. Edición", value: "nroEdicion" },
        { text: "Stock", value: "stock", sortable: false }
      ],
      ediciones: [],
      edicionesSeleccionadas: [],
      nombre: null,
      cargando: false,
      getOk: false,
      getError: false,
      timer: null
    };
  },
  methods: {
    getEdiciones() {
      this.cargando = true;
      this.getOk = false;
      this.getError = false;

      this.$http
        .get(`${process.env.VUE_APP_ROOT_API}ediciones`)
        .then(response => {
          this.cargando = false;
          this.getOk = true;
          this.ediciones = response.data;
          for(var i = 0; i<this.ediciones.length; i++ )
          {
            for(var j = 0; j<this.detalle.length; j++ )
            {
              if(this.ediciones[i].id == this.detalle[j].idEdicion)
              {
                this.ediciones[i].selected = true;
                this.detalle[j].selected = true;
              }
            }  
          }
        })
        .catch(error => {
          this.cargando = false;
          this.getError = true;
        });
    },
    agregar(item) {
      item.idEdicion = item.id?item.id:item.idEdicion;
      if (item.selected) { 
        if (!this.detalle.some(d => d.idEdicion == item.idEdicion)) {
          this.detalle.push({
            idEdicion : item.idEdicion,
            cantidad : null,
            nombreArticulo : item.nombreArticulo,
            nroEdicion : item.nroEdicion,
            fechaEdicion : item.fechaEdicion,
            precioVenta : item.precioVenta,
            precioRendicion : item.precioRendicion,
            id : null
          });
        }
      } else {
        this.$emit("quitar", item);
      }
    },
    cancelar() {
      this.$emit("close");
      this.nombre = null;
      this.limpiar();
    },
    limpiar() {
      this.getOk = false;
      this.getError = false;
    }
  },
  created() {
    this.getEdiciones();
  },
  computed: {
    mensaje() {
      if (this.getError) {
        return "Ocurrió un error al intentar obtener los datos, revise su conexión e intente nuevamente.";
      } else {
        return "Aquí apareceran los artículos en stock.";
      }
    }
  }
};
</script>
<style>
.scrollable-list {
  /*max-height: 400px;*/
  height: 300px;
  overflow-y: auto;
}

</style>
