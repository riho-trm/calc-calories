<template>
  <div class="top-wrapper">
    <div class="container">
      <div class="title">
        <span v-if="!isEdit">{{ defaultMyData.title }}</span>
        <BaseInput
          v-if="isEdit"
          id="my-data-title"
          name="my-data-title"
          placeholder="タイトル"
          type="text"
          v-model="defaultMyData.title"
          @change="onUpdateMyData"
        />
      </div>
      <div class="flex-wrapper">
        <div class="input-nutrients">
          <div class="nutrients-search-form">
            <SimpleTypeahead
              v-if="isEdit"
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
              v-for="(data, index) in defaultMyNutrients"
              :key="index"
            >
              <div class="icon-btn" @click="deleteItem(index)">
                <fa v-if="isEdit" icon="trash-can" />
              </div>
              <div class="food-name">{{ data.nutrient.food_name }}</div>
              <div class="food-input">
                <div class="gram-input">
                  <span v-if="!isEdit">{{ data.quantity }}</span>
                  <BaseInput
                    v-if="isEdit"
                    id="quantity-input"
                    class="quantity-input"
                    name="quantity"
                    type="text"
                    v-model="data.quantity"
                    @change="
                      calcNutrient(
                        Number($event.target.value),
                        index,
                        data.nutrient.food_name
                      )
                    "
                  />
                  <p class="gram">g</p>
                </div>
                <AppProcessingButton
                  v-if="data.estimatedIdList.length >= 1 && isEdit"
                  class="input-estimated-btn"
                  buttonText="目安量で入力"
                  @processing="
                    openInputEstimatedModal(
                      data.nutrient.food_name,
                      data.estimatedIdList,
                      index
                    )
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <div class="display-informations">
          <div class="display-nutrients">
            <div class="display-nutrients-title">総カロリーと三大栄養素</div>
            <div class="calculated-nutrient">
              <div class="cn carolies">
                エネルギー：{{ totalNutrient.calories }}kcal
              </div>
              <div class="cn protain">
                たんぱく質：{{ totalNutrient.protain }}g
              </div>
              <div class="cn fat">脂質：{{ totalNutrient.fat }}g</div>
              <div class="cn carbon">
                炭水化物：{{ totalNutrient.carbohydrate }}g
              </div>
            </div>
            <AppProcessingButton
              class="show-all-nutrient-btn"
              buttonText="全ての栄養素を見る"
              @processing="openShowAllNutrientModal"
            />
          </div>

          <div class="display-memo">
            <BaseLabel class="label" id="memo">memo</BaseLabel>
            <br />
            <span v-if="!isEdit">{{ defaultMyData.memo }}</span>
            <textarea
              v-if="isEdit"
              rows="5"
              id="memo"
              name="memo"
              type="text"
              v-model="defaultMyData.memo"
              @change="onUpdateMyData"
            ></textarea>
          </div>
          <div class="display-url">
            <BaseLabel class="label" id="url">URL</BaseLabel>
            <br />
            <span v-if="!isEdit">{{ defaultMyData.url }}</span>
            <BaseInput
              v-if="isEdit"
              id="url"
              name="url"
              type="text"
              v-model="defaultMyData.url"
              @change="onUpdateMyData"
            />
          </div>
        </div>
      </div>
      <div class="btn">
        <AppProcessingButton
          class="delete-btn"
          buttonText="削除"
          @processing="openDeleteModal"
        />
        <AppCancelButton
          class="return-btn"
          buttonText="戻る"
          @cancel="onclickCancelButton"
        />
        <AppProcessingButton
          v-if="!isEdit"
          class="edit-btn"
          buttonText="編集"
          @processing="isEdit = true"
        />
        <AppProcessingButton
          v-if="isEdit"
          class="save-btn"
          buttonText="保存"
          @processing="save"
        />
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
      <ConfirmationModal
        :isVisible="deleteModalVisible"
        message="削除してよろしいですか？"
        @cancel="closeDeleteModal"
        @processing="deleteMyData"
      />
      <ConfirmationModal
        :isVisible="cancelModalVisible"
        message="編集内容が破棄されますがよろしいですか？"
        @cancel="closeCancelModal"
        @processing="backPage"
      />
    </div>
  </div>
</template>

<script lang="ts">
// 6/14 残りの処理→APIへの保存処理
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import AppCancelButton from "@/components/container/AppCancelButton.vue";
import AppProcessingButton from "@/components/container/AppProcessingButton.vue";
import InputEstimatedModal from "@/components/InputEstimatedModal.vue";
import BaseInput from "@/components/presentational/BaseInput.vue";
import BaseLabel from "@/components/presentational/BaseLabel.vue";
import ShowAllNutrientModal from "@/components/ShowAllNutrientModal.vue";
import {
  DefaultMyData,
  DefaultMyNutrients,
  DeletedMyNutrients,
  EditedMyData,
  EditedMyNutrients,
  MyData,
  Nutrients,
  TotalNutrient,
} from "@/types/task";
import axios from "axios";
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SimpleTypeahead from "vue3-simple-typeahead";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    SimpleTypeahead,
    BaseLabel,
    BaseInput,
    AppProcessingButton,
    AppCancelButton,
    ConfirmationModal,
    InputEstimatedModal,
    ShowAllNutrientModal,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const typeahead = ref<InstanceType<typeof SimpleTypeahead>>();

    // 画面表示関連変数
    // 保存済みデータ（title,memoなど）
    let defaultMyData = reactive({}) as DefaultMyData;
    // 保存済み食品一覧
    let defaultMyNutrients = reactive([]) as Array<DefaultMyNutrients>;
    // 検索サジェスト機能用食品名一覧
    let sugestItems = reactive([]);
    // 計算済み栄養素合計
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

    // フラグ関連変数
    // 編集ボタンを押下した際にフラグをたてる（true）
    let isEdit = ref(false);

    // モーダル関連変数
    // 目安量入力モーダルに渡す情報
    let inputEstimatedModalData = reactive({
      inputEstimatedModalVisible: false,
      foodName: "",
      estimatedIdList: [],
      stateIndex: -1,
    });
    // 栄養素一覧モーダルを表示するためのフラグ
    let showAllNutrientModalVisible = ref(false);
    // 削除確認モーダルを表示するためのフラグ
    let deleteModalVisible = ref(false);
    // キャンセル確認モーダルを表示するためのフラグ
    let cancelModalVisible = ref(false);

    // 更新関連変数
    // myデータ（メモ、タイトルなど）の更新内容を保存
    let editedMyData = reactive({}) as EditedMyData;
    // 食品一覧の更新内容を保存
    let editedMyNutrients = reactive({}) as EditedMyNutrients;
    // 削除済み食品一覧を保存
    let deletedMyNutirients = reactive({}) as DeletedMyNutrients;

    /**
     * 栄養素合計変数を0で初期化する.
     */
    const resetTotalNutrient = () => {
      for (const key in totalNutrient) {
        totalNutrient[key] = 0;
      }
    };

    /**
     * 初期表示のために各変数に値を入れる.
     */
    const created = async () => {
      // 各更新済みフラグをおろす
      editedMyData.isEdited = false;
      editedMyNutrients.isEdited = false;
      deletedMyNutirients.isDeleted = false;
      try {
        // 検索用サジェストリストをストアから取得
        sugestItems = store.getters.getSugestList;
        // 目安量一覧をAPIから取得してstoreに格納
        await store.dispatch("getEstimatedQuantity");

        // リクエストパラメータから対象データのidを取得
        const targetId = Number(route.params.id);
        // 対象のmyデータをストアから取得
        const myDataRes: MyData = await store.getters.getMyData(targetId);
        if (myDataRes === undefined) {
          router.push("/notfound");
        } else {
          // defaultMyData初期設定
          defaultMyData.savedDataId = myDataRes.savedDataId;
          defaultMyData.title = myDataRes.title;
          defaultMyData.memo = myDataRes.memo;
          defaultMyData.url = myDataRes.url;
          // defaultMyNutrient初期設定
          for (const data of myDataRes.myNutrients) {
            const foodName = await store.getters.getNutrientById(
              data.nutrientId
            ).food_name;
            const nutrientRes: Nutrients =
              await store.getters.calcNutrientsQuanrity(
                foodName,
                data.quantity
              );
            const estimatedIdRes: Array<number> =
              await store.getters.getEstimatedIdList(data.nutrientId);
            defaultMyNutrients.push({
              savedNutrientsId: data.savedNutrientsId,
              quantity: data.quantity,
              estimatedIdList: estimatedIdRes,
              nutrient: nutrientRes,
            });
          }
          // totalNutrient初期設定
          for (const totalKey in totalNutrient) {
            for (const nutrient of defaultMyNutrients) {
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
        }
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

    /**
     * サジェストリストが選択された際の処理.
     *
     * @param foodName - サジェストリストから選択された食品名
     */
    const selectItem = async (foodName: string) => {
      const nutrientRes: Nutrients = await store.getters.calcNutrientsQuanrity(
        foodName,
        0
      );
      const estimatedIdRes = await store.getters.getEstimatedIdList(
        nutrientRes.id
      );
      defaultMyNutrients.push({
        savedNutrientsId: -100,
        quantity: 0,
        estimatedIdList: estimatedIdRes,
        nutrient: nutrientRes,
      });

      // モジュールのdata内のinputにアクセスしてリセット
      typeahead.value.input = "";
    };
    /**
     * タイトル、メモ、urlが更新された際に更新済み変数に格納.
     */
    const onUpdateMyData = () => {
      editedMyData.isEdited = true;
      editedMyData.title = defaultMyData.title;
      editedMyData.memo = defaultMyData.memo;
      editedMyData.url = defaultMyData.url;
    };
    /**
     * 食品の数量が変更された際に栄養素の計算を行う.
     *
     * @param quantity - 新たに入力された食品の量
     * @param index - 対象のdefaultMyNutrientsのindex番号
     * @param foodName - 対象の食品名
     */
    const calcNutrient = (
      quantity: number,
      index: number,
      foodName: string
    ) => {
      // 対象の食品名、量をストアに送って計算結果を返してもらう
      const res: Nutrients = store.getters.calcNutrientsQuanrity(
        foodName,
        quantity
      );
      // 表示用栄養素変数に計算結果を格納
      defaultMyNutrients[index].nutrient = res;
      // totalMutrientをリセットしてdefaultMyNutrientに格納されている栄養素を合計する
      resetTotalNutrient();
      for (const totalKey in totalNutrient) {
        for (const nutrient of defaultMyNutrients) {
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
      // 更新用メソッドを呼び出し
      updateEditedNutrients(
        defaultMyNutrients[index].savedNutrientsId,
        quantity
      );
    };
    /**
     * 食品情報が更新された際にAPIに送る用に更新部分を変数に格納する.
     *
     * @param sevedNutrientsId - DBに格納されているmyデータの栄養素id
     * @param newQuantity - 更新された量
     */
    const updateEditedNutrients = (
      savedNutrientsId: number,
      newQuantity: number
    ) => {
      // editedMyNutrientsに同一idの食品情報が保存されている場合にtrue
      let hasId = false;

      if (savedNutrientsId === -100) {
        // savedNutrientsIdが-100（新規登録食品）の場合は何もしない
        return;
      } else if (editedMyNutrients.editedData === undefined) {
        // 初めてeditedMyNutrientsに格納処理を行う場合に配列を作成する
        editedMyNutrients.isEdited = true;
        editedMyNutrients.editedData = [];
        editedMyNutrients.editedData.push({
          savedNutrientsId: savedNutrientsId,
          quantity: newQuantity,
        });
      } else {
        editedMyNutrients.isEdited = true;
        // 同一情報がすでに変数内にある場合は更新する
        for (const data of editedMyNutrients.editedData) {
          if (data.savedNutrientsId === savedNutrientsId) {
            data.quantity = newQuantity;
            hasId = true;
          }
        }
        // ない場合は新しく配列に情報を入れる
        if (!hasId) {
          editedMyNutrients.editedData.push({
            savedNutrientsId: savedNutrientsId,
            quantity: newQuantity,
          });
        }
      }
    };
    /**
     *  食品情報を削除する.
     *
     * @param index - 削除対象のdefaultMyNutrientsのindex番号
     */
    const deleteItem = (index: number) => {
      for (const totalKey in totalNutrient) {
        for (const stateKey in defaultMyNutrients[index].nutrient) {
          if (totalKey === stateKey) {
            const subNutrient =
              Math.round(
                (totalNutrient[totalKey] -= defaultMyNutrients[index].nutrient[
                  stateKey
                ] as number) * 100
              ) / 100;
            totalNutrient[totalKey] = subNutrient;
          }
        }
      }
      updateDeletedMyNutrients(defaultMyNutrients[index].savedNutrientsId);
      defaultMyNutrients.splice(index, 1);
    };
    /**
     * 削除済み食品idをAPIに送るために変数に格納する.
     *
     * @param savedNutrientsId - DBに格納されているmyデータの栄養素id
     */
    const updateDeletedMyNutrients = (savedNutrientsId: number) => {
      // 削除済みリスト追加処理
      if (savedNutrientsId === -100) {
        return;
      } else if (deletedMyNutirients.savedNutrientsId === undefined) {
        deletedMyNutirients.isDeleted = true;
        deletedMyNutirients.savedNutrientsId = [];
        deletedMyNutirients.savedNutrientsId.push(savedNutrientsId);
      } else {
        deletedMyNutirients.isDeleted = true;
        deletedMyNutirients.savedNutrientsId.push(savedNutrientsId);
      }
      // 削除したデータがeditedMyNutrientsにある場合削除
      for (const index in editedMyNutrients.editedData) {
        if (
          editedMyNutrients.editedData[index].savedNutrientsId ===
          savedNutrientsId
        ) {
          editedMyNutrients.editedData.splice(Number(index), 1);
        }
        if (editedMyNutrients.editedData.length === 0) {
          editedMyNutrients.isEdited = false;
        }
      }
    };
    /**
     * 目安量入力モーダルを開く.
     *
     * @param foodName - 対象の食品名
     * @param estimatedIdList - 目安量id一覧
     * @param index - 対象のdefaultMyNutrientsのindex番号
     */
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

    // 目安量登録モーダル関連
    /**
     * 目安量入力モーダルで計算した値をセットし、栄養素を計算する.
     *
     * @param calculatedQuantity - 計算済みの量
     * @param index - 対象のdefaultMyNutrientsのindex番号
     * @param foodName - 対象の食品名
     */
    const setQuantity = (
      calculatedQuantity: number,
      index: number,
      foodName: string
    ) => {
      defaultMyNutrients[index].quantity = calculatedQuantity;
      calcNutrient(calculatedQuantity, index, foodName);
      closeInputEstimatedModal();
    };
    /**
     * 目安量登録モーダルを閉じる.
     */
    const closeInputEstimatedModal = () => {
      inputEstimatedModalData.inputEstimatedModalVisible = false;
    };

    // 栄養素一覧表示モーダル関連
    /**
     * 栄養素一覧表示モーダルを開く.
     */
    const openShowAllNutrientModal = () => {
      showAllNutrientModalVisible.value = true;
    };
    /**
     * 栄養素一覧表示モーダルを閉じる.
     */
    const closeShowAllNutrientModal = () => {
      showAllNutrientModalVisible.value = false;
    };

    // 削除確認モーダル関連
    /**
     * 削除確認モーダルを開く.
     */
    const openDeleteModal = () => {
      deleteModalVisible.value = true;
    };
    /**
     * 削除確認モーダルを閉じる.
     */
    const closeDeleteModal = () => {
      deleteModalVisible.value = false;
    };
    /**
     * myデータを削除する.
     */
    const deleteMyData = async () => {
      try {
        const res = await store.dispatch(
          "deleteMyData",
          defaultMyData.savedDataId
        );
        router.push("/mydatalist");
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

    // 戻る確認モーダル関連
    /**
     * 戻るボタンが押された際の処理
     *
     * @remarks 編集中であれば戻る確認モーダルを開き、そうでなければmyデータリストに戻る
     */
    const onclickCancelButton = () => {
      if (isEdit.value) {
        cancelModalVisible.value = true;
      } else {
        router.push("/mydatalist");
      }
    };
    /**
     * 戻る確認モーダルを閉じる.
     */
    const closeCancelModal = () => {
      cancelModalVisible.value = false;
    };
    /**
     * myデータリストに遷移する.
     */
    const backPage = () => {
      router.push("/mydatalist");
    };

    /**
     * 変更データを保存する.
     */
    const save = async () => {
      try {
        if (editedMyData.isEdited === true) {
          await store.dispatch("updateSavedData", {
            title: editedMyData.title,
            memo: editedMyData.memo,
            url: editedMyData.url,
            savedDataId: defaultMyData.savedDataId,
          });
        }
        if (editedMyNutrients.isEdited === true) {
          let editedData = [];
          for (const data of editedMyNutrients.editedData) {
            editedData.push([data.savedNutrientsId, 0, 0, data.quantity]);
          }
          await store.dispatch("updateSavedNutrients", {
            editedData: editedData,
          });
        }
        if (deletedMyNutirients.isDeleted === true) {
          const savedNutrientsId: number[] = [];
          deletedMyNutirients.savedNutrientsId.forEach((data) =>
            savedNutrientsId.push(data)
          );
          await store.dispatch("deleteSavedNutrients", savedNutrientsId);
        }
        // 新たに追加された食品情報を保存
        let sendDataOfMyNutrients = [];
        for (const data of defaultMyNutrients) {
          if (data.savedNutrientsId === -100) {
            sendDataOfMyNutrients.push([
              defaultMyData.savedDataId,
              data.nutrient.id,
              data.quantity,
            ]);
          }
        }
        if (sendDataOfMyNutrients.length >= 1) {
          await store.dispatch("saveMyNutrients", sendDataOfMyNutrients);
        }
        router.push("/mydatalist");
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
      typeahead,
      defaultMyData,
      defaultMyNutrients,
      sugestItems,
      totalNutrient,
      isEdit,
      inputEstimatedModalData,
      showAllNutrientModalVisible,
      deleteModalVisible,
      cancelModalVisible,
      editedMyData,
      editedMyNutrients,
      deletedMyNutirients,

      selectItem,
      resetTotalNutrient,
      onUpdateMyData,
      calcNutrient,
      updateEditedNutrients,
      deleteItem,
      updateDeletedMyNutrients,
      openInputEstimatedModal,
      setQuantity,
      closeInputEstimatedModal,
      openShowAllNutrientModal,
      closeShowAllNutrientModal,
      openDeleteModal,
      closeDeleteModal,
      deleteMyData,
      onclickCancelButton,
      closeCancelModal,
      backPage,
      save,
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

.top-wrapper {
  background-color: #f0f9ff;
  min-height: 100vh;
  .container {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 2rem;
    .title {
      padding-top: 2rem;
      span {
        font-size: 2.5rem;
        font-weight: bold;
        color: #39587d;
      }
    }
    .flex-wrapper {
      display: flex;
      padding-bottom: 2rem;
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
              cursor: pointer;
              width: 10%;
              font-size: 2rem;
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
                span {
                  font-size: 1rem;
                }
                .gram {
                  font-size: 1rem;
                  margin-left: 0.3rem;
                }
              }
              .input-estimated-btn {
                margin: 0.6rem 0;
              }
            }
          }
        }
      }
      .display-informations {
        width: 50%;
        font-size: 1rem;
        .display-nutrients {
          padding-bottom: 1rem;
          .display-nutrients-title {
            font-weight: bold;
            color: #39587d;
            padding-top: 2rem;
            padding-bottom: 0.5rem;
          }
          .calculated-nutrient {
            padding-bottom: 0.5rem;
            .cn {
              padding-bottom: 0.5rem;
            }
          }
          :deep(.btn) {
            font-size: 0.8rem;
            padding: 0.5rem 1rem;
          }
        }
        .display-memo,
        .display-url {
          padding-bottom: 1rem;
          .label {
            margin-bottom: 0.5rem;
          }
          :deep(label) {
            font-weight: bold;
            color: #39587d;
          }
        }
        .display-memo {
          textarea {
            background-color: #fff;
            border: 1px solid #dcdcdc;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: 3px;
            font-size: 100%;
          }
        }
      }
    }
    .btn {
      width: 80%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      :deep(.btn) {
        font-size: 1rem;
        padding: 0.5rem 2.5rem;
        margin: 0 1rem;
      }
      .delete-btn {
        :deep(.btn--color) {
          background-color: red;
          border: 2px solid red;
          &:hover {
            color: red;
            background: #fff;
          }
        }
      }
    }
  }
}
</style>
