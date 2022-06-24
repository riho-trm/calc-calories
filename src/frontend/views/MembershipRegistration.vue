<template>
  <div class="container">
    <div class="title-wrapper">
      <img
        class="title-img"
        src="../assets/title_logo.png"
        alt="タイトルロゴ"
      />
      <p>EASY CALCAL</p>
    </div>

    <div class="register-wrapper">
      <div class="register-form">
        <h2>新規登録</h2>

        <div class="email">
          <BaseInput
            id="email-input"
            name="email-input"
            type="email"
            placeholder="メールアドレス"
            v-model="state.email"
          />
          <div
            class="input-errors"
            v-for="(error, index) in v$.email.$errors"
            :key="index"
          >
            <div class="error-msg" v-if="error.$validator == 'required'">
              メールアドレスを入力してください
            </div>
            <div class="error-msg" v-else-if="error.$validator == 'email'">
              メールアドレスの形式が不正です
            </div>
          </div>
          <div class="error-msg">
            {{ resErrorMessage.email }}
          </div>
        </div>

        <div class="user-id">
          <BaseInput
            id="user-id-input"
            name="euser-id-input"
            type="text"
            placeholder="ユーザーネーム"
            v-model="state.userName"
          />
          <div
            class="input-errors"
            v-for="(error, index) in v$.userName.$errors"
            :key="index"
          >
            <div class="error-msg" v-if="error.$validator == 'required'">
              ユーザーネームを入力してください
            </div>
          </div>
          <div class="error-msg">
            {{ resErrorMessage.userName }}
          </div>
        </div>

        <div class="password">
          <BaseInput
            id="password-input"
            name="password"
            type="password"
            placeholder="パスワード"
            v-model="state.password"
          />
          <div
            class="input-errors"
            v-for="(error, index) in v$.password.$errors"
            :key="index"
          >
            <div class="error-msg" v-if="error.$validator === 'required'">
              パスワードを入力してください
            </div>
            <div class="error-msg" v-if="error.$validator === 'fixedPassword'">
              大小半角英数字混在で8文字以上のパスワードを入力してください
            </div>
          </div>
        </div>
        <AppProcessingButton
          class="btn register-btn"
          buttonText="登録"
          @processing="validateTest"
        />
        <hr />
        <AppRoutingButton
          class="btn login-btn"
          buttonText="登録済みの方はこちら"
          routing="login"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import BaseInput from "@/components/presentational/BaseInput.vue";
import AppProcessingButton from "@/components/container/AppProcessingButton.vue";
import AppRoutingButton from "@/components/container/AppRoutingButton.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

interface InputType {
  email: string;
  userName: string;
  password: string;
}

export default defineComponent({
  components: {
    BaseInput,
    AppProcessingButton,
    AppRoutingButton,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const state: InputType = reactive({
      email: "",
      userName: "",
      password: "",
    });
    const resErrorMessage = reactive({
      email: "",
      userName: "",
    });

    const fixedPassword = (value: string) => {
      const passwordRegex =
        /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/;
      if (value.length === 0) {
        return true;
      } else {
        return passwordRegex.test(value);
      }
    };

    const rules = computed(() => ({
      email: { required, email },
      userName: { required },
      password: {
        required,
        fixedPassword,
      },
    }));
    const v$ = useVuelidate(rules, state);

    const validateTest = async () => {
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) return;
      // バリデーションエラーじゃない場合にやりたい処理
      handleLogin(state);
    };

    const handleLogin = async (registerInfo: InputType) => {
      try {
        const res = await store.dispatch("register", registerInfo);
        if (res.status === "error") {
          resErrorMessage.email = res.message.email;
          resErrorMessage.userName = res.message.userName;
        } else {
          const sendData = {
            email: registerInfo.email,
            password: registerInfo.password,
          };
          const loginRes = await store.dispatch("login", sendData);
          if (loginRes.status === "error") {
            console.log(loginRes);
          } else {
            router.push({ path: "/" });
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    return {
      state,
      resErrorMessage,
      v$,
      validateTest,
    };
  },
});
</script>

<style lang="scss" scoped>
.container {
  .title-wrapper {
    width: 40%;
    padding-left: 2rem;
    text-align: left;
    display: flex;
    align-items: center;
    img {
      height: 80px;
    }
    p {
      width: 80%;
      height: 100%;
      font-size: 1.5rem;
      font-weight: bold;
    }
  }

  .register-wrapper {
    width: 60%;
    border: solid;
    border-color: #dfdfdf;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    // position: relative;
    .register-form {
      width: 90%;
      margin-left: auto;
      margin-right: auto;
      //   position: absolute;
      //   top: 50%;
      //   left: 50%;
      //   transform: translateY(-50%) translateX(-50%);
      //   -webkit-transform: translateY(-50%) translateX(-50%);
      h2 {
        padding: 20px 0;
        font-size: 2rem;
      }
      :deep(.input-form) {
        width: 50%;
        height: 35px;
        border: 1px solid #dcdcdc;
      }
      .email,
      .user-id,
      .password {
        margin-bottom: 35px;
      }
      .error-msg {
        color: red;
      }
      .btn {
        padding: 0;
        :deep(.btn) {
          font-size: 1rem;
          padding: 0.5rem 2rem;
        }
      }
      .register-btn {
        margin-bottom: 35px;
      }
      .login-btn {
        margin: 35px 0;
      }
      hr {
        height: 1px;
        width: 80%;
        margin: 0 auto;
        background-color: #dcdcdc;
        border: none;
      }
    }
  }
}
</style>
