<template>
  <div class="navbar">
    <div class="navbar-start">
      <router-link to="/" class="navbar-item">MonkeyBattle</router-link>
      <router-link v-if="authenticated" to="/dashboard" class="navbar-item">
        Dashboard
      </router-link>
      <router-link to="/about" class="navbar-item">How to play</router-link>
      <router-link v-if="authenticated" to="/leaderboard" class="navbar-item">
        Leaderboard
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { userStore } from "@/store";
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "AppHeader",
  setup() {
    const authenticated = computed(userStore.getters.isAuthenticated);
    return {
      authenticated,
    };
  },
});
</script>

<style>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: var(--bg-secondary);
}

.navbar-item {
  padding-right: 10px;
}
</style>
