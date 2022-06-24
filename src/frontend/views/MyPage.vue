<template>
  <div class="top-wrapper">
    <div class="mypage-form">
      <h2>マイページ</h2>
      <div class="form-wrapper">
        <div class="email">
          <div class="heading-title">メールアドレス</div>
          <div class="user-information">{{ userInformation.email }}</div>
        </div>

        <div class="user-id">
          <div class="heading-title">ユーザーネーム</div>
          <div class="user-information">{{ userInformation.userName }}</div>
        </div>

        <div class="password">
          <div class="heading-title">パスワード</div>
          <div class="user-information">●●●●●●●●●●●●</div>
        </div>
        <div class="logout-btn">
          <AppProcessingButton buttonText="ログアウト" @processing="logout" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AppProcessingButton from "@/components/container/AppProcessingButton.vue";
import { defineComponent, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  components: { AppProcessingButton },
  setup() {
    const store = useStore();
    const router = useRouter();

    let userInformation = {
      email: "",
      userName: "",
    };

    const created = async () => {
      const res = store.getters.getUserInformation;
      userInformation.email = res.email;
      userInformation.userName = res.userName;
    };
    created();

    const logout = async () => {
      await store
        .dispatch("logout")
        .then(() => {
          router.push("/login");
        })
        .catch((error) => {
          throw error;
        });
    };
    return {
      userInformation,
      logout,
    };
  },
});
</script>

<style lang="scss" scoped>
.top-wrapper {
  width: 60%;
  border: solid;
  border-color: #dfdfdf;
  margin: 20px auto;
  .mypage-form {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    h2 {
      padding: 20px 0;
      font-size: 2rem;
    }
    .form-wrapper {
      width: 80%;
      margin-left: auto;
      margin-right: auto;

      .heading-title {
        font-size: 1rem;
        font-weight: 500;
        text-align: left;
        padding-bottom: 0.3rem;
      }
      .user-information {
        width: 60%;
        margin-left: auto;
        margin-right: auto;
        font-size: 0.8rem;
        border-bottom: 1px solid #6f6f6f;
      }

      .email,
      .user-id,
      .password {
        margin-bottom: 35px;
      }
      .logout-btn {
        width: 60%;
        margin-left: auto;
        margin-right: auto;
        padding: 0;
        padding: 1.5rem 0;
        :deep(.btn) {
          font-size: 1rem;
          padding: 0.5rem 2rem;
          margin: 0 1rem;
        }
      }
    }
  }
}
</style>
