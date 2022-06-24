import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import axios from "axios";
import { EstimatedAmountList, MyData, Nutrients } from "@/types/task";

export default createStore({
  // ステート
  state: {
    // リクエストヘッダーに含めるトークン
    authHeader: {
      headers: {
        Authorization: ``,
      },
    },
    // ログイン中のユーザー情報
    auth: {
      token: localStorage.getItem("token"),
      userId: -1,
      userName: "",
      email: "",
      isAdmin: 0, // 0:false,1:true
    },
    // 栄養成分一覧
    nutrients: [] as Array<Nutrients>,
    // 目安量一覧
    estimatedAmountList: [] as Array<EstimatedAmountList>,
    // Myデータ一覧
    myDataList: [] as Array<MyData>,
  },

  // ゲッター
  getters: {
    // ログイン中のユーザー情報を取得
    getUserInformation(state) {
      return state.auth;
    },
    // 栄養素のサジェストに使う食品名一覧を取得
    getSugestList(state) {
      const list = [];
      for (const nutrient of state.nutrients) {
        list.push(nutrient.food_name);
      }
      return list;
    },
    // ステートの目安量一覧を取得
    getEstimatedAmountList(state) {
      return state.estimatedAmountList;
    },
    // 渡されたidに基づく目安量を1件取得
    getEstimatedAmount: (state) => (id: number) => {
      const data = state.estimatedAmountList.find((data) => data.id === id);
      return data;
    },
    // 渡された栄養素idに基づく目安量id一覧を配列で取得
    getEstimatedIdList: (state) => (id: number) => {
      const data = [];
      for (const estimatedAmount of state.estimatedAmountList) {
        if (estimatedAmount.nutrientId === id) {
          data.push(estimatedAmount.id);
        }
      }
      return data;
    },
    // 渡された食品名に基づく栄養素を1件取得
    getNutrient: (state) => (foodName: string) => {
      const data = state.nutrients.find((data) => data.food_name === foodName);
      return data;
    },
    // 渡されたidに基づく栄養素を1件取得
    getNutrientById: (state) => (id: number) => {
      return state.nutrients.find((data) => data.id === id);
    },
    // 食材量を基に栄養量を計算
    calcNutrientsQuanrity:
      (state) => (foodName: string, foodQuantity: number) => {
        const list = {} as Nutrients;
        const data = state.nutrients.find(
          (n: Nutrients) => n.food_name === foodName
        );
        if (data) {
          for (const key in data) {
            if (
              key === "id" ||
              key === "classification_id" ||
              key === "food_number" ||
              key === "food_name" ||
              key === "disposal_rate"
            ) {
              list[key] = data[key] as never;
            } else {
              const quantity = data[key] as number;
              const calcQuantity = (foodQuantity / 100) * quantity;
              list[key] = Math.round(calcQuantity * 100) / 100;
            }
          }
        }
        1;

        return list;
      },
    // myデータ一覧を取得
    getMyDataList(state) {
      return state.myDataList;
    },
    // 渡されたidに基づくmyデータを1件取得
    getMyData: (state) => (id: number) => {
      return state.myDataList.find((data) => data.savedDataId === id);
    },
  },

  // ミューテーション
  mutations: {
    // ログイン時にユーザー情報を格納
    login(state, payload) {
      state.auth.token = payload.token;
      state.auth.userId = payload.id;
      state.auth.userName = payload.userName;
      state.auth.email = payload.email;
      state.auth.isAdmin = payload.isAdmin;
      state.authHeader = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
    },
    // ログアウト時にユーザー情報を削除
    logout(state) {
      state.auth.token = null;
      state.auth.userId = -1;
      state.auth.userName = "";
      state.auth.email = "";
      state.auth.isAdmin = 0;
      state.authHeader = {
        headers: {
          Authorization: "",
        },
      };
      state.nutrients = [];
      state.estimatedAmountList = [];
    },
    // 栄養成分一覧を格納
    setNutrients(state, payload) {
      state.nutrients = payload;
    },
    // 目安量一覧を格納
    setEstimatedAmountList(state, payload) {
      // stateのestimatedAmountListのデータ全削除
      state.estimatedAmountList.splice(0);
      for (const data of payload) {
        const targetNutrient = state.nutrients.find(
          (n: Nutrients) => n.id === data.nutrient_id
        );
        if (targetNutrient) {
          state.estimatedAmountList.push({
            id: data.id,
            classificationId: data.classification_id,
            nutrientId: data.nutrient_id,
            foodName: targetNutrient.food_name,
            foodNameTodisplay: data.food_name_todisplay,
            unit: data.unit,
            standardQuantity: data.standard_quantity,
            includeDisposal: data.include_disposal,
            creeatedAt: new Date(Date.parse(data.creeated_at)).toLocaleString(),
            updatedAt: new Date(Date.parse(data.updated_at)).toLocaleString(),
          });
        }
      }
    },
    // 目安量一覧から対象のデータを削除
    deleteEstimatedAmountList(state, payload) {
      state.estimatedAmountList.splice(payload, 1);
    },
    // myデータを格納
    setMyData(state, payload: MyData[]) {
      state.myDataList = payload;
    },
  },

  // アクション
  actions: {
    // ログイン
    async login(context, data) {
      try {
        const sendData = {
          email: data.email,
          password: data.password,
        };
        const res = await axios.post(
          "https://calc-carlories.herokuapp.com/login/login",
          sendData
        );
        if (res.data.status === "error") {
          return res.data;
        } else {
          localStorage.setItem("token", res.data.token);
          context.commit("login", res.data);
          context.dispatch("getNutrients");
          return res.data;
        }
      } catch (error) {
        console.log(error);
      }
    },
    // 会員登録
    async register(context, data) {
      try {
        const sendData = {
          email: data.email,
          userName: data.userName,
          password: data.password,
          isadmin: false,
        };
        const res = await axios.post(
          "https://calc-carlories.herokuapp.com/login/register",
          sendData
        );
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    // 栄養素一覧取得
    async getNutrients(context) {
      try {
        const res = await axios.get(
          "https://calc-carlories.herokuapp.com/nutrients/nutrientslist",
          context.state.authHeader
        );
        context.commit("setNutrients", res.data);
      } catch (error: any) {
        throw error.response;
      }
    },
    // 目安量登録
    async saveEstimatedQuantity(context, data) {
      const targetNutrient = context.state.nutrients.find(
        (n) => n.food_name === data.nutrientsListFoodName
      );
      if (targetNutrient) {
        const sendData = {
          classificationId: targetNutrient.classification_id,
          nutrientId: targetNutrient.id,
          foodNameTodisplay: data.toDisplayFoodName,
          unit: data.unit,
          standardQuantity: data.standardQuantity,
          includeDisposal: data.includeDisposal,
        };

        try {
          const res = await axios.post(
            "https://calc-carlories.herokuapp.com/nutrients/registestimatedquantity",
            sendData,
            context.state.authHeader
          );
        } catch (error: any) {
          throw error.response;
        }
      }
    },
    // 保存済み目安量一覧取得
    async getEstimatedQuantity(context) {
      try {
        const res = await axios.get(
          "https://calc-carlories.herokuapp.com/nutrients/estimatedquantitylist",
          context.state.authHeader
        );
        context.commit("setEstimatedAmountList", res.data);
      } catch (error: any) {
        throw error.response;
      }
    },
    // 登録済目安量削除
    async deleteEstimatedQuantity(context, id) {
      try {
        const res = await axios.delete(
          "https://calc-carlories.herokuapp.com/nutrients/deleteestimatedquantity",
          // deleteメソッドでは引数を3つ取れないのでこの形で渡す
          {
            data: { id },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const targetIndex = context.state.estimatedAmountList.findIndex(
          (data) => data.id === id
        );
        context.commit("deleteEstimatedAmountList", targetIndex);
        return targetIndex;
      } catch (error: any) {
        throw error.response;
      }
    },
    // 登録済目安量編集
    async updateEstimatedQuantity(context, sendData) {
      try {
        const res = await axios.put(
          "https://calc-carlories.herokuapp.com/nutrients/updateestimatedquantity",
          sendData,
          context.state.authHeader
        );
        return res;
      } catch (error: any) {
        throw error.response;
      }
    },
    //myデータ保存
    async saveMydata(context, data) {
      try {
        const sendData = {
          userId: context.state.auth.userId,
          title: data.title,
          memo: data.memo,
          url: data.url,
        };
        const res = await axios.post(
          "https://calc-carlories.herokuapp.com/save/savemydata",
          sendData,
          context.state.authHeader
        );
        return res.data.insertId;
      } catch (error: any) {
        throw error.response;
      }
    },
    // myデータに紐付いた栄養情報を保存
    async saveMyNutrients(context, data) {
      try {
        const res = await axios.post(
          "https://calc-carlories.herokuapp.com/save/savemynutrients",
          data,
          context.state.authHeader
        );
        // return res;
      } catch (error: any) {
        throw error.response;
      }
    },
    // 保存されたmyデータを取得
    async getmydata(context) {
      try {
        const savedDataRes = await axios.get(
          "https://calc-carlories.herokuapp.com/save/getmydata",
          {
            params: { userId: this.state.auth.userId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const savedDataId: number[] = [];
        savedDataRes.data.myData.forEach((data: { id: number }) =>
          savedDataId.push(data.id)
        );
        const savedNutrientsRes = await axios.get(
          "https://calc-carlories.herokuapp.com/save/getmynutrients",
          {
            params: { savedDataId: savedDataId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const savedData = savedDataRes.data.myData;
        const savedNutrients = savedNutrientsRes.data.myNutrients;
        const payload = [];
        for (const data of savedData) {
          const myNutrients = [];
          for (const nutrient of savedNutrients) {
            if (nutrient.saved_data_id === data.id) {
              myNutrients.push({
                savedNutrientsId: nutrient.id,
                nutrientId: nutrient.nutrient_id,
                quantity: nutrient.quantity,
              });
            }
          }
          payload.push({
            savedDataId: data.id,
            title: data.title,
            memo: data.memo,
            url: data.url,
            createdAt: new Date(Date.parse(data.created_at)).toLocaleString(),
            updatedAt: new Date(Date.parse(data.updated_at)).toLocaleString(),
            myNutrients: myNutrients,
          });
        }
        context.commit("setMyData", payload);
      } catch (error: any) {
        // const errorMessage = error.response.data || error.message;
        throw error.response;
      }
    },

    // myデータを1件削除
    async deleteMyData(context, savedDataId) {
      try {
        const res = await axios.delete(
          "https://calc-carlories.herokuapp.com/save/deletemydata",
          // deleteメソッドでは引数を3つ取れないのでこの形で渡す
          {
            data: { savedDataId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        return res;
      } catch (error: any) {
        throw error.response;
      }
    },
    // myデータのsaved_dataを更新
    async updateSavedData(context, sendData) {
      try {
        const res = await axios.put(
          "https://calc-carlories.herokuapp.com/save/updatesaveddata",
          sendData,
          context.state.authHeader
        );
        return res;
      } catch (error: any) {
        throw error.response;
      }
    },
    // myデータのsaved_nutrientsを更新
    async updateSavedNutrients(context, sendData) {
      try {
        const res = await axios.put(
          "https://calc-carlories.herokuapp.com/save/updatesavednutrients",
          sendData,
          context.state.authHeader
        );
        return res;
      } catch (error: any) {
        throw error.response;
      }
    },
    // myデータのsaved_nutrientsを削除
    async deleteSavedNutrients(context, savedNutrientsId) {
      try {
        const res = await axios.delete(
          "https://calc-carlories.herokuapp.com/save/deletesavednutrients",
          // deleteメソッドでは引数を3つ取れないのでこの形で渡す
          {
            data: { savedNutrientsId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        return res;
      } catch (error: any) {
        throw error.response;
      }
    },

    // ログアウト
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
      // storage: window.sessionStorage,
    }),
  ],
});
