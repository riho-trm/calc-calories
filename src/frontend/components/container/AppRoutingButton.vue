<template>
  <BaseButton :button-text="buttonText" @button-clicked="routeTo" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseButton from "@/components/presentational/BaseButton.vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: { BaseButton },
  props: {
    // ボタンに表示するテキスト
    buttonText: {
      type: String,
      default: "PUSH",
    },
    // ルーティング先
    routing: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    /**
     * ルーティングを実施.
     */
    const routeTo = () => {
      router.push("/" + props.routing);
    };
    return { routeTo };
  },
});
</script>

<style></style>
