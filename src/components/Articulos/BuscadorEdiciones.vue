<template>
  <v-card>
    <v-toolbar color="secondary" flat dark dense extense>
      <v-toolbar-title>Selección de artículos</v-toolbar-title>
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
              <!--<td>
                
                <v-checkbox v-model="props.item.selected" @change="agregar(props.item)"></v-checkbox>
              </td>-->
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
    /*buscarArticulos() {
      this.cargando = true;
      this.getOk = false;
      this.getError = false;
      if (!this.nombre) {
        this.articulos = [];
        this.cargando = false;
      } else {
        this.$http
          .get(
            `${process.env.VUE_APP_ROOT_API}articulos/buscar?nombre=` +
              this.nombre
          )
          .then(response => {
            this.cargando = false;
            this.getOk = true;
            this.articulos = response.data;
            console.log(response.data);
          })
          .catch(error => {
            this.cargando = false;
            this.getError = true;
            console.log(response.data);
          });
      }
    },*/
    getDatosFake() {
      this.ediciones.push({
        nombreArticulo: "Diario ABC Color",
        nroEdicion: "12234",
        fechaEdicion: "02-03-2019",
        cantidadActual: 77,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 10 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Ultima Hora",
        nroEdicion: "123123",
        fechaEdicion: "02-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 9 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Cronica",
        nroEdicion: "1123123",
        fechaEdicion: "02-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 8 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Popular",
        nroEdicion: "12211",
        fechaEdicion: "02-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 7 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario La Nación",
        nroEdicion: "13212",
        fechaEdicion: "02-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 6 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario ABC Color",
        nroEdicion: "12234",
        fechaEdicion: "03-03-2019",
        cantidadActual: 10,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 5 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Ultima Hora",
        nroEdicion: "121224",
        fechaEdicion: "03-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 4 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Cronica",
        nroEdicion: "122323",
        fechaEdicion: "03-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 3 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario Popular",
        nroEdicion: "1221134",
        fechaEdicion: "03-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 2 //idEdicion
      });
      this.ediciones.push({
        nombreArticulo: "Diario La Nación",
        nroEdicion: "122324",
        fechaEdicion: "03-03-2019",
        cantidadActual: 110,
        precioVenta: 6000,
        precioRendicion: 5200,
        idArticulo: null,
        idPrecio: null,
        id: 1 //idEdicion
      });
    },
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
        //item.index = this.detalle.length  
        if (!this.detalle.some(d => d.idEdicion == item.idEdicion)) {
          this.detalle.push(item);
        }
      } else {
        console.log("hola");
        this.$emit("quitar", item);
      }
    },
    /*searchTimeOut() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.buscarArticulos();
      }, 800); // agrega delay luego de cada tipeo
    },*/
    cancelar() {
      this.$emit("close");
      this.nombre = null;
      this.limpiar();
    },
    limpiar() {
      this.getOk = false;
      this.getError = false;
      //this.ediciones = [];
    }
  },
  created() {
    //this.getDatosFake();
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
