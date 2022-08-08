<template>
  <div>
    <div v-if="notFound">
      <div class="center-container">
        <div>
          <h1 class="title">Game not found</h1>
          <router-link :to="{ name: 'Dashboard' }" class="button outlined">
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </div>

    <Suspense v-else>
      <template #default>
        <Game :ai="ai" :deckId="deckId" @notFound="notFound = true" />
      </template>
      <template #fallback> Loading game... </template>
    </Suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Game from "@/components/game/Game.vue";

export default defineComponent({
  name: "GameView",
  props: {
    ai: {
      type: Boolean,
    },
    deckId: {
      type: Number,
    },
  },
  components: {
    Game,
  },

  setup() {
    const notFound = ref(false);
    return { notFound };
  },
});
</script>

<style scoped>
.center-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: auto 0;
}
</style>
