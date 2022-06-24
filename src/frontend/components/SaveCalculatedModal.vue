<template>
  <teleport to="body">
    <div
      class="modal"
      id="cancel-modal"
      v-show="isVisible"
      @click="close"
    ></div>
    <div class="modal-content" v-show="isVisible">
      <div class="modal-wrapper">
        <div class="cancel" @click="close"><fa icon="xmark" /></div>
        <div class="title-input">
          <BaseLabel id="title"
            >タイトル<span class="required">（必須）</span></BaseLabel
          >
          <BaseInput
            id="title"
            name="title"
            type="text"
            v-model="state.title"
          />
          <div
            class="input-errors"
            v-for="(error, index) in v$.title.$errors"
            :key="index"
          >
            <div class="error-msg" v-if="error.$validator == 'required'">
              タイトルを入力してください
            </div>
          </div>
        </div>
        <div class="memo-input">
          <BaseLabel id="memo">メモ</BaseLabel>
          <!-- <BaseInput id="memo" name="memo" type="text" v-model="memo" /> -->
          <textarea
            rows="5"
            id="memo"
            name="memo"
            type="text"
            v-model="memo"
          ></textarea>
        </div>
        <div class="url-input">
          <BaseLabel id="url">URL</BaseLabel>
          <BaseInput id="url" name="url" type="text" v-model="url" />
        </div>
        <div class="btn">
          <AppProcessingButton buttonText="保存" @processing="processing" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import BaseInput from "./presentational/BaseInput.vue";
import BaseLabel from "./presentational/BaseLabel.vue";
import AppProcessingButton from "./container/AppProcessingButton.vue";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";

export default defineComponent({
  components: { BaseLabel, BaseInput, AppProcessingButton },
  props: {
    isVisible: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "processing"],
  setup(props, context) {
    const state = reactive({
      title: "",
    });
    const title = ref("");
    const memo = ref("");
    const url = ref("");

    // バリデーションルール
    const rules = computed(() => ({
      title: { required },
    }));
    const v$ = useVuelidate(rules, state);
    /**
     * キャンセルを通知.
     */
    const close = () => {
      context.emit("close");
      // title.value = "";
      state.title = "";
      memo.value = "";
      url.value = "";
    };
    /**
     * 反映ボタンが押された際の処理.
     *
     * @remarks
     * バリデーションチェックを行い、エラーでない場合親に各値と共に反映ボタンが押されたことを通知.
     */
    const processing = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) return;
      // バリデーションエラーじゃない場合にやりたい処理
      context.emit("processing", state.title, memo.value, url.value);
      // title.value = "";
      state.title = "";
      memo.value = "";
      url.value = "";
    };

    return {
      state,
      title,
      memo,
      url,
      v$,
      close,
      processing,
    };
  },
});
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal-content {
  font-family: "Kiwi Maru", serif;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  // モーダルの幅や色などはお好きにどうぞ！
  background-color: white;
  width: 600px;
  height: auto;
  padding: 20px;
  .modal-wrapper {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    :deep(label) {
      font-size: 1.3rem;
      font-weight: 450;
      padding: 1rem 0;
      display: block;
      width: 100%;
      text-align: left;
    }
    :deep(.input-form) {
      width: 95%;
      height: 35px;
      border: 1px solid #dcdcdc;
      font-size: 100%;
      margin-left: 1rem;
    }
    .cancel {
      font-size: 2rem;
      text-align: right;
      color: gray;
      cursor: pointer;
    }
    .title-input {
      .required,
      .error-msg {
        color: red;
      }
    }
    .memo-input {
      textarea {
        width: 95%;
        background-color: #fff;
        border: 1px solid #dcdcdc;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        border-radius: 3px;
        font-size: 100%;
        margin-left: 1rem;
      }
    }
    .btn {
      width: 70%;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      justify-content: center;
      padding: 2rem 0;
      :deep(.btn) {
        font-size: 1.5rem;
        padding: 0.5rem 2rem;
        margin: 0 1rem;
      }
    }
  }
}
</style>
