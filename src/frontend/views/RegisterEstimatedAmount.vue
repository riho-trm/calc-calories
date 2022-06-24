<template>
  <div class="top-wrapper">
    <div class="container">
      <div class="page-title">
        <div class="title">目安量登録</div>
        <p>※目安量はDBに登録されている食材のみ登録可能です</p>
      </div>
      <div class="food-name-form">
        <BaseLabel id="food-name">食材名（栄養成分表登録名）</BaseLabel>
        <SimpleTypeahead
          id="food-name-input"
          placeholder="食材名を検索"
          :items="sugestItems"
          :minInputLength="1"
          @selectItem="selectItem"
        />
        <!-- 後でdisabledのcssを設定 -->
        <BaseInput
          id="selected-food"
          name="selected-food"
          type="text"
          placeholder="自動入力"
          v-model="state.nutrientsListFoodName"
          disabled
        />
        <div
          class="input-errors"
          v-for="(error, index) in v$.nutrientsListFoodName.$errors"
          :key="index"
        >
          <div class="error-msg" v-if="error.$validator == 'required'">
            入力してください
          </div>
        </div>
      </div>
      <div class="display-food-name-form">
        <BaseLabel id="display-food-name">食材名（表示用）</BaseLabel>
        <BaseInput
          id="display-food-name"
          name="display-food-name"
          type="text"
          v-model="state.toDisplayFoodName"
        />
        <div
          class="input-errors"
          v-for="(error, index) in v$.toDisplayFoodName.$errors"
          :key="index"
        >
          <div class="error-msg" v-if="error.$validator == 'required'">
            入力してください
          </div>
        </div>
      </div>
      <div class="unit-form">
        <BaseLabel id="unit-name"
          >単位（例:大さじ、個etc、数量は1固定）</BaseLabel
        >
        <BaseInput
          id="unit-name"
          name="unit-name"
          type="text"
          v-model="state.unit"
        />
        <div
          class="input-errors"
          v-for="(error, index) in v$.unit.$errors"
          :key="index"
        >
          <div class="error-msg" v-if="error.$validator == 'required'">
            入力してください
          </div>
        </div>
      </div>
      <div class="standard-quantity-form">
        <BaseLabel id="standard-quantity-name">単位あたりの量（g）</BaseLabel>
        <BaseInput
          id="standard-quantity-name"
          name="standard-quantity-name"
          type="text"
          v-model="state.standardQuantity"
        />
        <div
          class="input-errors"
          v-for="(error, index) in v$.standardQuantity.$errors"
          :key="index"
        >
          <div class="error-msg" v-if="error.$validator == 'required'">
            入力してください
          </div>
          <div
            class="error-msg"
            v-if="error.$validator == 'fixedStandardQuantity'"
          >
            半角数字で入力してください
          </div>
        </div>
      </div>
      <div class="include-disposal-form">
        <BaseLabel id="include-disposal-name">廃棄率を含む</BaseLabel>
        <BaseCheckbox
          id="include-display-name"
          name="include-display-name"
          v-model:modelValue="state.includeDisposal"
        />
      </div>
      <div class="button">
        <AppCancelButton buttonText="キャンセル" @cancel="showModal" />
        <AppProcessingButton buttonText="保存" @processing="validateTest" />
      </div>
    </div>
    <div class="cancel-modal">
      <ConfirmationModal
        :isVisible="modalVisible"
        message="編集内容が破棄されますがよろしいですか？"
        @cancel="closeModal"
        @processing="backPage"
      />
    </div>
  </div>
</template>

<script lang="ts">
import BaseInput from "@/components/presentational/BaseInput.vue";
import BaseLabel from "@/components/presentational/BaseLabel.vue";
import BaseCheckbox from "@/components/presentational/BaseCheckBox.vue";
import AppProcessingButton from "@/components/container/AppProcessingButton.vue";
import AppCancelButton from "@/components/container/AppCancelButton.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import SimpleTypeahead from "vue3-simple-typeahead";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    BaseLabel,
    SimpleTypeahead,
    BaseInput,
    BaseCheckbox,
    AppCancelButton,
    AppProcessingButton,
    ConfirmationModal,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const state = reactive({
      nutrientsListFoodName: "",
      toDisplayFoodName: "",
      unit: "",
      standardQuantity: null as null | number,
      includeDisposal: false,
    });
    let sugestItems = reactive([]);
    let modalVisible = ref(false);

    const created = async () => {
      sugestItems = store.getters.getSugestList;
    };
    created();

    const selectItem = (item: any) => {
      state.nutrientsListFoodName = item;
    };

    const fixedStandardQuantity = (value: string) => {
      const standardQuantityRegex = /^([1-9]\d*|0)(\.\d+)?$/;
      if (value == null || value.length == 0) {
        return true;
      } else {
        return standardQuantityRegex.test(value);
      }
    };

    const rules = computed(() => ({
      nutrientsListFoodName: { required },
      toDisplayFoodName: { required },
      unit: { required },
      standardQuantity: {
        required,
        fixedStandardQuantity,
      },
    }));
    const v$ = useVuelidate(rules, state);
    const validateTest = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) return;
      // バリデーションエラーじゃない場合にやりたい処理
      save(state);
    };

    const save = async (data: any) => {
      try {
        const res = await store.dispatch("saveEstimatedQuantity", data);
        router.push("/adminmenu");
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

    const showModal = () => {
      modalVisible.value = true;
    };
    const closeModal = () => {
      modalVisible.value = false;
    };

    const backPage = () => {
      router.push("/adminmenu");
    };

    return {
      state,
      sugestItems,
      modalVisible,
      v$,
      validateTest,
      selectItem,
      save,
      showModal,
      closeModal,
      backPage,
    };
  },
});
</script>

<style lang="scss" scoped>
:deep(label) {
  font-size: 1rem;
  font-weight: 450;
  padding: 1rem 5rem;
  display: block;
  width: 100%;
  text-align: left;
}
:deep(.input-form) {
  width: 50%;
  height: 35px;
  border: 1px solid #dcdcdc;
  font-size: 150%;
}

.top-wrapper {
  background-color: #f0f9ff;
  .container {
    width: 90%;
    background-color: white;
    margin-left: auto;
    margin-right: auto;
    .error-msg {
      color: red;
      font-size: 0.8rem;
    }
    .page-title {
      display: flex;
      padding: 2rem 2rem;
      justify-content: space-around;
      .title {
        font-size: 2rem;
        font-weight: 500;
      }
      p {
        font-size: 1.3rem;
        display: flex;
        align-items: center;
      }
    }
    .food-name-form {
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
      :deep(#selected-food) {
        background-color: #bcbbbb;
      }
    }
    .include-disposal-form {
      :deep(#include-display-name) {
        transform: scale(2);
      }
    }
    .button {
      width: 60%;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      justify-content: center;
      padding: 0;
      padding: 2rem 0;
      :deep(.btn) {
        font-size: 1rem;
        padding: 0.5rem 2rem;
        margin: 0 1rem;
      }
    }
  }
}
</style>
