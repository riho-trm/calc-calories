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
        <div class="title">全栄養成分</div>
        <table>
          <tr>
            <th>項目</th>
            <th>計算値</th>
          </tr>
          <tr>
            <td>エネルギー</td>
            <td>{{ totalNutrient.calories }} kcal</td>
          </tr>
          <tr>
            <td>水分</td>
            <td>{{ totalNutrient.water }} g</td>
          </tr>
          <tr>
            <td>たんぱく質</td>
            <td>{{ totalNutrient.protain }} g</td>
          </tr>
          <tr>
            <td>アミノ酸組成によるたんぱく質</td>
            <td>{{ totalNutrient.protein_due_to_amino_acid_composition }} g</td>
          </tr>
          <tr>
            <td>脂質</td>
            <td>{{ totalNutrient.fat }} g</td>
          </tr>
          <tr>
            <td>コレステロール</td>
            <td>{{ totalNutrient.cholesterol }} mg</td>
          </tr>
          <tr>
            <td>脂肪酸のトリアシルグリセロール当量</td>
            <td>{{ totalNutrient.fatty_acid_triacylglycerol_equivalent }} g</td>
          </tr>
          <tr>
            <td>炭水化物</td>
            <td>{{ totalNutrient.carbohydrate }} g</td>
          </tr>
          <tr>
            <td>糖アルコール</td>
            <td>{{ totalNutrient.sugar_alcohol }} g</td>
          </tr>
          <tr>
            <td>食物繊維総量</td>
            <td>{{ totalNutrient.dietary_fiber }} g</td>
          </tr>
          <tr>
            <td>利用可能炭水化物差引き法による</td>
            <td>
              {{ totalNutrient.available_carbohydrates_by_deduction_method }} g
            </td>
          </tr>
          <tr>
            <td>利用可能炭水化物（質量計）</td>
            <td>{{ totalNutrient.available_carbohydrates_by_mass_meter }} g</td>
          </tr>
          <tr>
            <td>利用可能炭水化物（単糖当量）</td>
            <td>
              {{
                totalNutrient.available_carbohydrates_by_monosaccharide_equivalent
              }}
              g
            </td>
          </tr>
          <tr>
            <td>有機酸</td>
            <td>{{ totalNutrient.organic_acid }} g</td>
          </tr>
          <tr>
            <td>灰分</td>
            <td>{{ totalNutrient.ash }} g</td>
          </tr>
          <tr>
            <td>ナトリウム</td>
            <td>{{ totalNutrient.sodium }} mg</td>
          </tr>
          <tr>
            <td>カリウム</td>
            <td>{{ totalNutrient.potassium }} mg</td>
          </tr>
          <tr>
            <td>カルシウム</td>
            <td>{{ totalNutrient.calcium }} mg</td>
          </tr>
          <tr>
            <td>マグネシウム</td>
            <td>{{ totalNutrient.magnesium }} mg</td>
          </tr>
          <tr>
            <td>リン</td>
            <td>{{ totalNutrient.phosphorus }} mg</td>
          </tr>
          <tr>
            <td>鉄</td>
            <td>{{ totalNutrient.iron }} mg</td>
          </tr>
          <tr>
            <td>亜鉛</td>
            <td>{{ totalNutrient.zinc }} mg</td>
          </tr>
          <tr>
            <td>銅</td>
            <td>{{ totalNutrient.copper }} mg</td>
          </tr>
          <tr>
            <td>マンガン</td>
            <td>{{ totalNutrient.manganese }} mg</td>
          </tr>
          <tr>
            <td>ヨウ素</td>
            <td>{{ totalNutrient.iodine }} μg</td>
          </tr>
          <tr>
            <td>セレン</td>
            <td>{{ totalNutrient.selenium }} μg</td>
          </tr>
          <tr>
            <td>クロム</td>
            <td>{{ totalNutrient.chromium }} μg</td>
          </tr>
          <tr>
            <td>モリブデン</td>
            <td>{{ totalNutrient.molybdenum }} μg</td>
          </tr>
          <tr>
            <td>レチノール</td>
            <td>{{ totalNutrient.retinol }} μg</td>
          </tr>
          <tr>
            <td>α-カロテン</td>
            <td>{{ totalNutrient.alpha_carotene }} μg</td>
          </tr>
          <tr>
            <td>β-カロテン</td>
            <td>{{ totalNutrient.beta_carotene }} μg</td>
          </tr>
          <tr>
            <td>β-クリプトキサンチン</td>
            <td>{{ totalNutrient.beta_cryptoxanthin }} μg</td>
          </tr>
          <tr>
            <td>β-カロテン当量</td>
            <td>{{ totalNutrient.beta_carotene_equivalent }} μg</td>
          </tr>
          <tr>
            <td>レチノール活性当量</td>
            <td>{{ totalNutrient.retinol_active_equivalent }} μg</td>
          </tr>
          <tr>
            <td>ビタミンD</td>
            <td>{{ totalNutrient.vitamin_d }} μg</td>
          </tr>
          <tr>
            <td>α-トコフェロール</td>
            <td>{{ totalNutrient.alpha_tocopherol }} mg</td>
          </tr>
          <tr>
            <td>β-トコフェロール</td>
            <td>{{ totalNutrient.beta_tocopherol }} mg</td>
          </tr>
          <tr>
            <td>γ-トコフェロール</td>
            <td>{{ totalNutrient.gamma_tocopherol }} mg</td>
          </tr>
          <tr>
            <td>δ-トコフェロール</td>
            <td>{{ totalNutrient.delta_tocopherol }} mg</td>
          </tr>
          <tr>
            <td>ビタミンK</td>
            <td>{{ totalNutrient.vitamin_k }} μg</td>
          </tr>
          <tr>
            <td>ビタミンB1</td>
            <td>{{ totalNutrient.vitamin_b1 }} mg</td>
          </tr>
          <tr>
            <td>ビタミンB2</td>
            <td>{{ totalNutrient.vitamin_b2 }} mg</td>
          </tr>
          <tr>
            <td>ナイアシン</td>
            <td>{{ totalNutrient.niacin }} mg</td>
          </tr>
          <tr>
            <td>ナイアシン当量</td>
            <td>{{ totalNutrient.niacin_equivalent }} mg</td>
          </tr>
          <tr>
            <td>ビタミンB6</td>
            <td>{{ totalNutrient.vitamin_b6 }} mg</td>
          </tr>
          <tr>
            <td>ビタミンB12</td>
            <td>{{ totalNutrient.vitamin_b12 }} μg</td>
          </tr>
          <tr>
            <td>葉酸</td>
            <td>{{ totalNutrient.folic_acid }} μg</td>
          </tr>
          <tr>
            <td>パントテン酸</td>
            <td>{{ totalNutrient.pantothenic_acid }} mg</td>
          </tr>
          <tr>
            <td>ビオチン</td>
            <td>{{ totalNutrient.biotin }} μg</td>
          </tr>
          <tr>
            <td>ビタミンC</td>
            <td>{{ totalNutrient.vitamin_c }} mg</td>
          </tr>
          <tr>
            <td>アルコール</td>
            <td>{{ totalNutrient.alcohol }} g</td>
          </tr>
          <tr>
            <td>食塩相当量</td>
            <td>{{ totalNutrient.sodium_chloride_equivalent }} g</td>
          </tr>
        </table>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, toRefs, watch } from "vue";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

export default defineComponent({
  props: {
    isVisible: {
      required: true,
      type: Boolean,
      default: false,
    },
    totalNutrient: {
      type: Object,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, context) {
    // propsのisVisibleを定義し直す
    const { isVisible } = toRefs(props);

    // body-scroll-lockライブラリを使用して、モーダルの背景のロックを制限
    watch(isVisible, () => {
      const modal = document.querySelector(".modal-content");
      if (isVisible.value === true) {
        disableBodyScroll(modal);
      } else if (isVisible.value === false) {
        clearAllBodyScrollLocks();
      }
    });

    /**
     * モーダルを閉じることを通知.
     */
    const close = () => {
      context.emit("close");
    };
    return {
      close,
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
  overflow-y: hidden;
  overflow-y: scroll;

  // モーダルの幅や色などはお好きにどうぞ！
  background-color: white;
  width: 600px;
  height: 60%;
  padding: 20px;
  .modal-wrapper {
    width: 90%;
    height: 100%;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
    .cancel {
      font-size: 2rem;
      text-align: right;
      color: gray;
      cursor: pointer;
    }
    .title {
      font-size: 2rem;
      font-weight: 400;
      padding-bottom: 1rem;
    }
    table {
      width: 95%;
      margin-left: auto;
      margin-right: auto;
      th {
        border-top: 1px solid #a28c63;
        font-weight: normal;
        background: #f0f9ff;
      }
      th,
      td {
        padding: 10px 20px;
        text-align: center;
        border-bottom: 1px solid #a28c63;
      }
    }
  }
}
</style>
