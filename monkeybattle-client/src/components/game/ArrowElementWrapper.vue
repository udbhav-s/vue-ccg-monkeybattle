<template>
  <template v-if="from && to">
    <Arrow :transition="true" :fromX="from.x" :fromY="from.y" :toX="to.x" :toY="to.y" />
  </template>
</template>

<script lang="ts">
// This component exists to lazily render arrows for targets in played cards
// since there can be a delay in socket messages between creaturePlayed and updateState messages
import { GameState } from "monkeybattle-shared";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref, watch } from "vue";
import Arrow from "./Arrow.vue";

export default defineComponent({
  name: "ArrowElementWrapper",
  props: {
    toElementId: {
      type: String,
      required: true,
    },
    fromElementId: {
      type: String,
      required: true,
    },
    game: {
      type: Object as PropType<GameState>,
      required: true,
    }
  },
  components: {
    Arrow,
  },

  setup(props) {
    const to = ref();
    const from = ref();

    let fromElement: HTMLElement | null; 
    let toElement: HTMLElement | null;

    watch(
      [
        () => props.toElementId,
        () => props.fromElementId,
      ],
      () => {
        fromElement = document.getElementById(props.fromElementId);
        toElement = document.getElementById(props.toElementId);
      },
      { immediate: true }
    );

    const setCoords = () => {
      // if elements haven't loaded
      // todo - performance concerns
      fromElement = document.getElementById(props.fromElementId);
      toElement = document.getElementById(props.toElementId);

      let rect = fromElement?.getBoundingClientRect();
      if (rect) from.value = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      }

      rect = document.getElementById(props.toElementId)?.getBoundingClientRect();
      if (rect) to.value = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      }
    };

    let animationHandle: number;

    const animateArrow = () => {
      setCoords();
      animationHandle = requestAnimationFrame(animateArrow);
    }

    onMounted(animateArrow);
    onBeforeUnmount(() => cancelAnimationFrame(animationHandle));

    return {
      from,
      to,
    };
  },
});
</script>