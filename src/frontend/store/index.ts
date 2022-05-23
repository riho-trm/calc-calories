import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import axios from "axios";

export default createStore({
  state: {
    auth: {
      token: localStorage.getItem("token"),
      userId: -1,
      userName: "",
      email: "",
      isAdmin: false,
    },
  },
  getters: {},
  mutations: {
    login(state, payload) {
      state.auth.token = payload.token;
      state.auth.userId = payload.id;
      state.auth.userName = payload.userName;
      state.auth.email = payload.email;
      state.auth.isAdmin = payload.isAdmin;
    },
    logout(state) {
      state.auth.token = null;
      state.auth.userId = -1;
      state.auth.userName = "";
      state.auth.email = "";
      state.auth.isAdmin = false;
    },
  },
  actions: {
    async login(context, data) {
      try {
        const sendData = {
          email: data.email,
          password: data.password,
        };
        const res = await axios.post(
          "http://localhost:3000/login/login",
          sendData
        );
        console.log(res);
        if (res.data.message) {
          console.log(`エラーがあったよ${res.data.message}`);
          console.dir(JSON.stringify(res.data));
          return { error: res.data.message };
        } else {
          console.log("正常に処理されたよ");
          localStorage.setItem("token", res.data.token);
          context.commit("login", res.data);
          console.log(res.data);
        }
      } catch (error) {
        console.log(error);
      }
    },
    logout(context) {
      localStorage.removeItem("token");
      context.commit("logout");
    },
  },
  modules: {},
  plugins: [
    createPersistedState({
      // ストレージのキーを指定(変更してなければデフォルトvuex)
      key: "vuex",
      // ストレージの種類を指定
      storage: window.sessionStorage,
    }),
  ],
});
