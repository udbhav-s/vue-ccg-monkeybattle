<template>
  <div class="container">
    <div class="title-hero">
      <div>
        <div class="logo-container">
          <img src="@/assets/images/logo.png" />
        </div>

        <div v-if="isAuthenticated">
          <button class="button outlined">
            <router-link :to="{ name: 'Dashboard' }">
              Go to dashboard
            </router-link>
          </button>
        </div>
        <div v-else-if="!loggedIn">
          <div class="login-container">
            <input type="text" v-model="username" placeholder="username" />
            <br />
            <input type="password" v-model="password" placeholder="password" />
          </div>
          <div>
            <button
              @click="login"
              class="button outlined"
              :disabled="loggingIn"
            >
              {{ loggingIn ? "Logging in..." : "Login" }}
            </button>
            <button
              @click="register"
              class="button outlined"
              :disabled="registering"
            >
              {{ loggingIn ? "Registering..." : "Register" }}
            </button>
          </div>
        </div>

        <div class="login-info">
          <div v-if="error" class="login-error">{{ error }}</div>
        </div>
      </div>
    </div>

    <div class="info-container">
      <h1 class="title">What is MonkeyBattle?</h1>
      <p>
        MonkeyBattle is a card game with mechanics similar to CCGs like
        Hearthstone. Each player builds card decks with a central hero card
        called a monkey. The hero cards are also divided into three thematic
        classes, which unlock access to certain cards in their decks. The
        objective of each game is to bring the opponent's monkey's health down
        to 0, using bananas given in each round to play cards from your deck.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import router from "@/router";
import { userService } from "@/services/user.service";
import { monkeyService } from "@/services/monkey.service";
import { deckService } from "@/services/deck.service";
import { computed, defineComponent, ref } from "vue";
import { userStore } from "@/store";

export default defineComponent({
  name: "Home",

  setup() {
    const username = ref("");
    const password = ref("");
    const isAuthenticated = computed(userStore.getters.isAuthenticated);
    const loggedIn = ref(false);
    const error = ref("");

    const loggingIn = ref(false);
    const login = async () => {
      error.value = "";
      loggingIn.value = true;

      try {
        await userService.login(username.value, password.value);
      } catch (e) {
        loggingIn.value = false;
        if (e instanceof Error) error.value = e.message;
        else error.value = "An error occured";
      }

      // fetch data
      await monkeyService.updateStoreMonkeys();
      await deckService.updateStoreDecks();

      // redirect
      router.push({ name: "Dashboard" });
      loggingIn.value = false;
    };

    const registering = ref(false);
    const register = async () => {
      error.value = "";
      registering.value = true;

      try {
        await userService.register(username.value, password.value);
      } catch (e) {
        registering.value = false;
        if (e instanceof Error) error.value = e.message;
        else error.value = "An error occured";
      }
      await login();

      registering.value = false;
    };

    return {
      username,
      password,
      isAuthenticated,
      login,
      loggingIn,
      register,
      registering,
      loggedIn,
      error,
    };
  },
});
</script>

<style>
.title-hero {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-hero button {
  margin: 2rem;
}

.logo-container {
  margin: 2rem auto;
  max-width: 600px;
}

.login-container {
  padding: 1rem;
}

.login-container input {
  padding: 0.5rem;
  margin-top: 1rem;
}

.login-info {
  margin-bottom: 1rem;
}

.login-error {
  color: var(--red-primary);
}

.info-container {
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 2rem;
  background: var(--bg-secondary);
  max-width: 1000px;
  margin: auto;
  margin-bottom: 2rem;
}

.info-container p {
  margin: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  text-align: left;
}
</style>
