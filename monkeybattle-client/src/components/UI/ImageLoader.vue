<template>
  <div>
    <img v-show="loaded" @load="loaded = true" :src="src" />
    <div v-if="!loaded" class="image-placeholder">
      <img :src="dataUrl" />
      <div></div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
export default defineComponent({
  name: "ImageLoader",
  props: {
    src: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: false,
    },
    height: {
      type: Number,
      required: false,
    },
  },

  setup(props) {
    const loaded = ref(false);
    const dataUrl = computed(
      () =>
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"
        width="${props.width ?? 500}" height="${props.height ?? 500}"></svg>`
    );
    return { loaded, dataUrl };
  },
});
</script>

<style>
.image-placeholder {
  position: relative;
}
.image-placeholder > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(255, 255, 255, 0.05),
    rgba(150, 150, 150, 0.05)
  );
  animation: gradient 1s ease infinite;
  background-size: 400% 400%;
}
@keyframes gradient {
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
}
</style>
