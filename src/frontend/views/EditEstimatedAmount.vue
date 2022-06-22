<template>
  <div class="top-wrapper">
    <div class="container">
      <div class="page-title">
        <div class="title">目安量編集</div>
        <p>※元データ（栄養成分表登録名）は変更できません</p>
      </div>
      <div class="food-name-form">
        <BaseLabel id="food-name">食材名（栄養成分表登録名）</BaseLabel>
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
      <div class="include-displsal-form">
        <BaseLabel id="include-displsal-name">廃棄率を含む</BaseLabel>
        <BaseCheckbox
          id="include-display-name"
          name="include-display-name"
          v-model="state.includeDisposal"
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
import { defineComponent, reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  components: {
    BaseLabel,
    BaseInput,
    BaseCheckbox,
    AppCancelButton,
    AppProcessingButton,
    ConfirmationModal,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    let state = reactive({
      id: -1,
      nutrientsListFoodName: "",
      toDisplayFoodName: "",
      unit: "",
      standardQuantity: null as null | number,
      includeDisposal: true,
    });
    let modalVisible = ref(false);

    const created = async () => {
      const targetId = Number(route.params.id);
      const res = await store.getters.getEstimatedAmount(targetId);
      if (res === undefined) {
        router.push("/notfound");
      } else {
        state.id = res.id;
        state.nutrientsListFoodName = res.foodName;
        state.toDisplayFoodName = res.foodNameTodisplay;
        state.unit = res.unit;
        state.standardQuantity = res.standardQuantity;
        state.includeDisposal = Boolean(res.includeDisposal);
      }
    };
    created();

    const fixedStandardQuantity = (value: string) => {
      const standardQuantityRegex = /^([1-9]\d*|0)(\.\d+)?$/;
      if (value.length == 0) {
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
      update(state);
    };

    const update = async (sendData: any) => {
      try {
        const res = await store.dispatch("updateEstimatedQuantity", sendData);
        router.push("/estimatedamountlist");
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
      router.push("/estimatedamountlist");
    };

    return {
      state,
      modalVisible,
      v$,
      validateTest,
      update,
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
      :deep(#selected-food) {
        background-color: #bcbbbb;
      }
    }
    .include-displsal-form {
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
