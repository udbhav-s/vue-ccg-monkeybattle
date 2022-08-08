<template>
  <app-header
    v-if="this.$route.name !== 'GameView' && this.$route.name !== 'DeckBuilder'"
  />
  <router-view />
  <!-- <app-footer
    v-if="this.$route.name !== 'GameView' && this.$route.name !== 'DeckBuilder'"
  /> -->
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import { userService } from "./services/user.service";
import { userStore } from "./store";
import "@/assets/css/main.css";

export default defineComponent({
  components: { AppHeader, AppFooter },
  name: "App",
  setup() {
    document.title = "MonkeyBattle";
    if (!userStore.getters.isAuthenticated()) {
      userService.setStoreUser();
    }
  },
});
</script>

<style></style>
