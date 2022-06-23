<template>
  <BaseButton :button-text="buttonText" @button-clicked="toProcess" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButton from "../presentational/BaseButton.vue";

export default defineComponent({
  components: { BaseButton },
  props: {
    // ボタンに表示するテキスト
    buttonText: {
      type: String,
      default: "PUSH",
    },
  },
  setup(props, context) {
    /**
     * 処理継続ボタンが押されたことをemitする.
     */
    const toProcess = () => {
      context.emit("processing");
    };
    return { toProcess };
  },
});
</script>

<style></style>
