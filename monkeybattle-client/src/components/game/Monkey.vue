<template>
  <div class="monkey-container" :class="[turn ? 'monkey-turn' : '']">
    <div
      class="monkey-health-container"
      :class="[healthTop ? 'monkey-health-top' : 'monkey-health-bottom']"
    >
      <transition name="slide" mode="out-in">
        <div :key="monkeyHealth" class="monkey-health">
          {{ monkeyHealth }}
        </div>
      </transition>
    </div>

    <ImageLoader
      class="monkey-img"
      :src="require('@/assets/images/monkeys/' + monkey.name + '.png')"
      :width="1200"
      :height="1600"
    />
  </div>
</template>

<script lang="ts">
import { Monkey } from "monkeybattle-shared";
import { defineComponent, PropType } from "vue";
import ImageLoader from "../UI/ImageLoader.vue";

export default defineComponent({
  name: "Monkey",
  components: {
    ImageLoader,
  },

  props: {
    monkey: {
      type: Object as PropType<Monkey>,
      required: true,
    },
    monkeyHealth: {
      type: Number,
      required: true,
    },
    healthTop: {
      type: Boolean,
      required: false,
    },
    turn: {
      type: Boolean,
      required: false,
    },
  },
});
</script>

<style>
.monkey-container {
  position: relative;
  box-sizing: content-box;
  border: 2px solid #555;
  min-width: 150px;
  min-height: 200px;
}

.monkey-container.monkey-turn {
  border: 2px solid var(--yellow-primary);
}

.monkey-health-container {
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-bg-primary);
  padding: 0.4rem;
  font-size: 1.2rem;
  position: absolute;
  width: 2ch;
  margin: auto;
  left: 0;
  right: 0;
}
.monkey-health {
  text-align: center;
}

.monkey-health-top {
  top: 0;
  transform: translateY(-50%);
}
.monkey-health-bottom {
  bottom: 0;
  transform: translateY(50%);
}
</style>
