<template>
  <div>
    <button type="button" class="btn btn--color btn--radius" @click="clicked">
      {{ buttonText }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: {
    // ボタンに表示するテキスト
    buttonText: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    /**
     * ボタンが押されたことを通知する.
     */
    const clicked = () => {
      context.emit("button-clicked");
    };
    return {
      clicked,
    };
  },
});
</script>

<style scoped lang="scss">
.btn {
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.5;
  position: relative;
  display: inline-block;
  padding: 1rem 4rem;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  color: #212529;
}
.btn--color {
  color: #fff;
  background-color: #39587d;
  border: 2px solid #39587d;
  &:hover {
    color: #39587d;
    background: #fff;
  }
}
.btn--radius {
  border-radius: 100vh;
}
</style>
