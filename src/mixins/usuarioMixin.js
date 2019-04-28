import store from "../store";

export default {
  methods: {
    getUserId() {
      return store.state.usuario.idusuario;
    },
    getUserFullName() {
      return store.state.usuario.NombreCompleto;
    },
  }
};
