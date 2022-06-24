<template>
  <BaseButton :button-text="buttonText" @button-clicked="cancel" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButton from "../presentational/BaseButton.vue";

export default defineComponent({
  components: {
    BaseButton,
  },
  props: {
    // ボタンに表示するテキスト
    buttonText: {
      type: String,
      default: "PUSH",
    },
  },
  setup(props, context) {
    /**
     * キャンセルボタンが押されたことをemitする.
     */
    const cancel = () => {
      context.emit("cancel");
    };
    return { cancel };
  },
});
</script>

<style></style>
