<template>
  <div class="top-wrapper">
    <div class="container">
      <div class="input-nutrients">
        <div class="nutrients-search-form">
          <SimpleTypeahead
            id="food-name-input"
            placeholder="食材名を検索"
            :items="sugestItems"
            :minInputLength="1"
            @selectItem="selectItem"
            ref="typeahead"
          />
        </div>
        <div class="input-quantity">
          <div
            class="quantity-list"
            v-for="(food, index) in state"
            :key="index"
          >
            <div class="icon-btn" @click="deleteItem(index)">
              <fa icon="trash-can" />
            </div>
            <div class="food-name">{{ food.nutrient.food_name }}</div>
            <div class="food-input">
              <div class="gram-input">
                <BaseInput
                  id="quantity-input"
                  class="quantity-input"
                  name="quantity"
                  type="text"
                  v-model="food.quantity"
                  @onBlur="calcNutrient($event, index, food.nutrient.food_name)"
                />
                <p class="gram">g</p>
              </div>
              <AppProcessingButton
                v-if="food.estimatedIdList.length >= 1"
                class="btn input-estimated-btn"
                buttonText="目安量で入力"
                @processing="
                  openInputEstimatedModal(
                    food.nutrient.food_name,
                    food.estimatedIdList,
                    index
                  )
                "
              />
            </div>
          </div>
          <AppCancelButton buttonText="リセット" @cancel="resetItem" />
        </div>
      </div>

      <div class="display-nutrients">
        <div class="title">総カロリーと三大栄養素</div>
        <div class="calculated-nutrient">
          <div class="cn carolies">
            エネルギー：{{ totalNutrient.calories }}kcal
          </div>
          <div class="cn protain">たんぱく質：{{ totalNutrient.protain }}g</div>
          <div class="cn fat">脂質：{{ totalNutrient.fat }}g</div>
          <div class="cn carbon">
            炭水化物：{{ totalNutrient.carbohydrate }}g
          </div>
        </div>
        <div class="modal-btn">
          <!-- あとでモーダルの開き分け設定を行う -->
          <AppProcessingButton
            class="btn show-all-nutrient-btn"
            buttonText="全ての栄養素を見る"
            @processing="openShowAllNutrientModal"
          />
          <AppProcessingButton
            class="btn save-btn"
            buttonText="保存"
            @processing="openSaveCalculatedModal"
          />
        </div>
      </div>
    </div>
    <div class="modal">
      <InputEstimatedModal
        :isVisible="inputEstimatedModalData.inputEstimatedModalVisible"
        :foodName="inputEstimatedModalData.foodName"
        :estimatedIdList="inputEstimatedModalData.estimatedIdList"
        :index="inputEstimatedModalData.stateIndex"
        @cancel="closeInputEstimatedModal"
        @processing="setQuantity"
      />
      <ShowAllNutrientModal
        :isVisible="showAllNutrientModalVisible"
        :totalNutrient="totalNutrient"
        @close="closeShowAllNutrientModal"
      />
      <SaveCalculatedModal
        :isVisible="saveCalculatedModalVisible"
        @close="closeSaveCalculatedModal"
        @processing="saveData"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { CalculatedNutrient, Nutrients, TotalNutrient } from "@/types/task";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import SimpleTypeahead from "vue3-simple-typeahead";
import { useStore } from "vuex";
import BaseInput from "@/components/presentational/BaseInput.vue";
import AppProcessingButton from "@/components/container/AppProcessingButton.vue";
import AppCancelButton from "@/components/container/AppCancelButton.vue";
import InputEstimatedModal from "@/components/InputEstimatedModal.vue";
import ShowAllNutrientModal from "@/components/ShowAllNutrientModal.vue";
import SaveCalculatedModal from "@/components/SaveCalculatedModal.vue";

export default defineComponent({
  components: {
    SimpleTypeahead,
    BaseInput,
    AppProcessingButton,
    AppCancelButton,
    InputEstimatedModal,
    ShowAllNutrientModal,
    SaveCalculatedModal,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const typeahead = ref<InstanceType<typeof SimpleTypeahead>>();

    let state = reactive([]) as Array<CalculatedNutrient>;
    let sugestItems = reactive([]);
    let inputEstimatedModalData = reactive({
      inputEstimatedModalVisible: false,
      foodName: "",
      estimatedIdList: [],
      stateIndex: -1,
    });
    let showAllNutrientModalVisible = ref(false);
    let saveCalculatedModalVisible = ref(false);
    let totalNutrient = reactive({
      calories: 0,
      water: 0,
      protein_due_to_amino_acid_composition: 0,
      protain: 0,
      fatty_acid_triacylglycerol_equivalent: 0,
      cholesterol: 0,
      fat: 0,
      available_carbohydrates_by_monosaccharide_equivalent: 0,
      available_carbohydrates_by_mass_meter: 0,
      available_carbohydrates_by_deduction_method: 0,
      dietary_fiber: 0,
      sugar_alcohol: 0,
      carbohydrate: 0,
      organic_acid: 0,
      ash: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      magnesium: 0,
      phosphorus: 0,
      iron: 0,
      zinc: 0,
      copper: 0,
      manganese: 0,
      iodine: 0,
      selenium: 0,
      chromium: 0,
      molybdenum: 0,
      retinol: 0,
      alpha_carotene: 0,
      beta_carotene: 0,
      beta_cryptoxanthin: 0,
      beta_carotene_equivalent: 0,
      retinol_active_equivalent: 0,
      vitamin_d: 0,
      alpha_tocopherol: 0,
      beta_tocopherol: 0,
      gamma_tocopherol: 0,
      delta_tocopherol: 0,
      vitamin_k: 0,
      vitamin_b1: 0,
      vitamin_b2: 0,
      niacin: 0,
      niacin_equivalent: 0,
      vitamin_b6: 0,
      vitamin_b12: 0,
      folic_acid: 0,
      pantothenic_acid: 0,
      biotin: 0,
      vitamin_c: 0,
      alcohol: 0,
      sodium_chloride_equivalent: 0,
    } as TotalNutrient);

    const created = async () => {
      try {
        sugestItems = store.getters.getSugestList;
        await store.dispatch("getEstimatedQuantity");
      } catch (error: any) {
        if (error.status === 401) {
          await store
            .dispatch("logout")
            .then(() => {
              router.push({
                name: "Login",
                params: {
                  message1: "セッションが途切れました。",
                  message2: "再度ログインしてください。",
                },
              });
            })
            .catch((error) => {
              throw error;
            });
        } else {
          console.log(error);
        }
      }
    };
    created();

    const resetTotalNutrient = () => {
      for (const key in totalNutrient) {
        totalNutrient[key] = 0;
      }
    };

    const selectItem = async (foodName: string) => {
      const nutrientRes: Nutrients = await store.getters.calcNutrientsQuanrity(
        foodName,
        0
      );
      const estimatedIdRes = await store.getters.getEstimatedIdList(
        nutrientRes.id
      );
      state.push({
        quantity: 0,
        estimatedIdList: estimatedIdRes,
        nutrient: nutrientRes,
      });

      // モジュールのdata内のinputにアクセスしてリセット
      typeahead.value.input = "";
    };

    const calcNutrient = (
      quantity: number,
      index: number,
      foodName: string
    ) => {
      const res: Nutrients = store.getters.calcNutrientsQuanrity(
        foodName,
        quantity
      );
      state[index].nutrient = res;
      resetTotalNutrient();
      for (const totalKey in totalNutrient) {
        for (const nutrient of state) {
          for (const nutrientKey in nutrient.nutrient) {
            if (nutrientKey === totalKey) {
              const plusNutrient =
                Math.round(
                  (totalNutrient[totalKey] += nutrient.nutrient[
                    nutrientKey
                  ] as number) * 100
                ) / 100;
              totalNutrient[totalKey] = plusNutrient;
            }
          }
        }
      }
    };

    const deleteItem = (index: number) => {
      for (const totalKey in totalNutrient) {
        for (const stateKey in state[index].nutrient) {
          if (totalKey === stateKey) {
            const subNutrient =
              Math.round(
                (totalNutrient[totalKey] -= state[index].nutrient[
                  stateKey
                ] as number) * 100
              ) / 100;
            totalNutrient[totalKey] = subNutrient;
          }
        }
      }
      state.splice(index, 1);
    };
    const resetItem = () => {
      state.splice(0);
      resetTotalNutrient();
    };

    const openInputEstimatedModal = (
      foodName: string,
      estimatedIdList: [],
      index: number
    ) => {
      inputEstimatedModalData.inputEstimatedModalVisible = true;
      inputEstimatedModalData.foodName = foodName;
      inputEstimatedModalData.estimatedIdList = estimatedIdList;
      inputEstimatedModalData.stateIndex = index;
    };
    const openSaveCalculatedModal = () => {
      saveCalculatedModalVisible.value = true;
    };
    const openShowAllNutrientModal = () => {
      showAllNutrientModalVisible.value = true;
    };

    const closeInputEstimatedModal = () => {
      inputEstimatedModalData.inputEstimatedModalVisible = false;
    };
    const closeSaveCalculatedModal = () => {
      saveCalculatedModalVisible.value = false;
    };
    const closeShowAllNutrientModal = () => {
      showAllNutrientModalVisible.value = false;
    };

    const setQuantity = (
      calculatedQuantity: number,
      index: number,
      foodName: string
    ) => {
      state[index].quantity = calculatedQuantity;
      calcNutrient(calculatedQuantity, index, foodName);
      closeInputEstimatedModal();
    };

    const saveData = async (title: string, memo: string, url: string) => {
      closeSaveCalculatedModal();
      try {
        const sendDataOfMydata = { title: title, memo: memo, url: url };
        const savedDataId = await store.dispatch(
          "saveMydata",
          sendDataOfMydata
        );
        let sendDataOfMyNutrients = [];
        for (const data of state) {
          sendDataOfMyNutrients.push([
            savedDataId,
            data.nutrient.id,
            data.quantity,
          ]);
        }
        await store.dispatch("saveMyNutrients", sendDataOfMyNutrients);
        router.push("/");
      } catch (error: any) {
        if (error.status === 401) {
          await store
            .dispatch("logout")
            .then(() => {
              router.push({
                name: "Login",
                params: {
                  message1: "セッションが途切れました。",
                  message2: "再度ログインしてください。",
                },
              });
            })
            .catch((error) => {
              throw error;
            });
        } else {
          console.log(error);
        }
      }
    };

    return {
      state,
      sugestItems,
      inputEstimatedModalData,
      showAllNutrientModalVisible,
      saveCalculatedModalVisible,
      totalNutrient,
      selectItem,
      typeahead,
      calcNutrient,
      deleteItem,
      resetItem,
      resetTotalNutrient,
      openInputEstimatedModal,
      openSaveCalculatedModal,
      openShowAllNutrientModal,
      closeInputEstimatedModal,
      closeSaveCalculatedModal,
      closeShowAllNutrientModal,
      setQuantity,
      saveData,
    };
  },
});
</script>

<style lang="scss" scoped>
:deep(.input-form) {
  width: 50%;
  height: 35px;
  border: 1px solid #dcdcdc;
  font-size: 150%;
}
:deep(.btn) {
  font-size: 1rem;
  padding: 0.5rem 2rem;
  margin: 0 1rem;
}

.top-wrapper {
  background-color: #f0f9ff;
  .container {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    min-height: 85vh;
    .input-nutrients {
      width: 50%;
      .nutrients-search-form {
        padding-top: 2rem;
        :deep(.simple-typeahead) {
          position: relative;
          .simple-typeahead-input {
            width: 50%;
            height: 35px;
            border: 1px solid #dcdcdc;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: 3px;
            margin-bottom: 1rem;
            font-size: 150%;
            background-color: white;
          }
          .simple-typeahead-list {
            position: absolute;
            top: 35px;
            left: 25%;
            width: 50%;
            max-height: 400px;
            overflow-y: auto;
            border-bottom: 0.1rem solid #d1d1d1;
            z-index: 9;
            margin-left: auto;
            margin-right: auto;
            .simple-typeahead-list-item {
              cursor: pointer;
              border-bottom: 0.1rem solid #d1d1d1;
              background-color: #fafafa;
              padding: 0.6rem 1rem;
              border-left: 0.1rem solid #d1d1d1;
              border-right: 0.1rem solid #d1d1d1;
            }
            .simple-typeahead-list-item-active {
              background-color: #e1e1e1;
            }
          }
        }
      }

      .input-quantity {
        width: 95%;
        margin-left: auto;
        margin-right: auto;
        background-color: white;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 3px;
        padding: 1rem;
        .quantity-list {
          border-bottom: 1px solid #dcdcdc;
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          .icon-btn {
            width: 10%;
            font-size: 2rem;
            cursor: pointer;
          }
          .food-name {
            width: 65%;
            font-size: 1rem;
          }
          .food-input {
            width: 25%;
            display: flex;
            flex-direction: column;
            :deep(.btn) {
              font-size: 0.2rem;
              padding: 0.1rem 0.3rem;
              margin: 0;
            }
            .gram-input {
              display: flex;
              justify-content: center;
              .gram {
                font-size: 1rem;
                margin-left: 00.3rem;
              }
            }
            .input-estimated-btn {
              margin: 0.6rem 0;
            }
          }
        }
      }
    }
    .display-nutrients {
      width: 50%;
      font-size: 2rem;
      .title {
        font-weight: bold;
        color: #39587d;
        padding-top: 2rem;
        padding-bottom: 1.5rem;
      }
      .calculated-nutrient {
        padding-bottom: 1.5rem;
        .cn {
          padding: 1rem 0;
        }
      }
      .modal-btn {
        .btn {
          margin-bottom: 1rem;
        }
      }
    }
  }
}
</style>
