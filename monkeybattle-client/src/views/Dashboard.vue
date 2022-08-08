<template>
  <div class="container" id="dashboard">
    <h1 class="title">Dashboard</h1>

    <div class="account-info-header">
      <h1>Profile Info</h1>
      <button @click="logout" class="button outlined">Log out</button>
    </div>
    <div class="section account-info" v-if="user">
      <div>{{ user.username }}</div>
      <div>Level {{ user.level }} - {{ user.xp }}xp</div>
    </div>

    <div class="decks-header">
      <h1>Decks</h1>
      <div class="right">
        <div v-if="typeof numOnline === 'number'" class="num-online">
          {{ numOnline }} online
        </div>
      </div>
    </div>

    <div class="section decks">
      <div
        class="deck"
        v-for="deck in decks"
        :key="deck.id"
        @click="selectedDeckId = deck.id"
        :class="{ 'selected-deck': selectedDeckId === deck.id }"
      >
        <div class="deck-name">
          <span>{{ deck.name }}</span>
          <router-link
            :to="{ name: 'DeckBuilder', params: { deckId: deck.id } }"
            class="deck-edit"
          >
            ✏️
          </router-link>
        </div>

        <ImageLoader
          class="monkey-img"
          :src="require('@/assets/images/monkeys/' + deck.monkey.name + '.png')"
          :ipfs="true"
          :width="1200"
          :height="1600"
        />
      </div>
      <router-link to="/newdeck" class="add-deck">
        <div>
          <div class="add-deck-plus">+</div>
          <div>New Deck</div>
        </div>
      </router-link>
    </div>

    <div class="play-options">
      <h1>Play</h1>
      <Tabs :tabs="playTabs" v-model:selectedIndex="playIndex" />

      <div v-if="playIndex === 0">
        <div class="queue-options-container">
          <div>
            No one in queue? Create your own custom room and invite a friend!
            Simply queue with any custom code and ask your friend to queue with
            the same (case-sensitive)
          </div>
          <div class="queue-button-container">
            <input
              v-model="customQueueName"
              type="text"
              placeholder="Custom Code"
            />
            <button
              @click="joinQueue"
              class="button outlined"
              :disabled="inQueue"
            >
              {{ inQueue ? "In Queue..." : "Queue" }}
            </button>
          </div>
        </div>
        <div class="notify-container">
          <div>🔔 Notify me when a match is found</div>
          <Toggle v-model="notify" />
        </div>
      </div>

      <div v-else>
        <div class="queue-options-container" style="margin: 1rem 0">
          <div>Practice against AI</div>
          <button @click="singlePlayer" class="button outlined">
            Single Player
          </button>
        </div>
      </div>
    </div>

    <div class="section recent-games">
      <h1>Recent games</h1>

      <table>
        <tr>
          <th>Opponent</th>
          <th>Result</th>
          <th>XP</th>
        </tr>

        <tr v-for="(gameRow, i) in recentGames" :key="i">
          <template v-if="gameRow.winner.id === user.id">
            <td>{{ gameRow.loser.id }}</td>
            <td>Won</td>
            <td>{{ gameRow.winningXp }}</td>
          </template>
          <template v-else>
            <td>{{ gameRow.winner.id }}</td>
            <td>Lost</td>
            <td>{{ gameRow.losingXp }}</td>
          </template>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { deckStore, userStore } from "@/store";
import { deckService } from "@/services/deck.service";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { queue, socket, useNumOnline } from "../services/game.service";
import router from "@/router";
import { userService } from "@/services/user.service";
import { useToast } from "vue-toastification";
import { GameRecord } from "@/types/gameRecord";
import ImageLoader from "@/components/UI/ImageLoader.vue";
import Toggle from "@/components/UI/Toggle.vue";
import Tabs from "@/components/UI/Tabs.vue";

export default defineComponent({
  name: "Dashboard",
  components: { Toggle, Tabs, ImageLoader },

  setup() {
    const toast = useToast();
    const selectedDeckId = ref<number>();
    const decks = computed(deckStore.getters.decks);
    const user = computed(userStore.getters.user);

    userService.setStoreUser();
    const { numOnline, getNumOnline } = useNumOnline();
    getNumOnline();

    onMounted(async () => {
      await deckService.updateStoreDecks();
      if (decks.value.length > 0) selectedDeckId.value = decks.value[0].id;
    });
    const inQueue = ref<boolean>(false);

    const logout = async () => {
      await userService.logout();
      userStore.mutations.logout();
      router.push("/");
    };

    const customQueueName = ref("");

    const playTabs = ref([{ text: "Online" }, { text: "Against Computer" }]);
    const playIndex = ref(0);

    const singlePlayer = () => {
      // exit queue
      socket.disconnect();
      // open single player
      router.push({
        name: "GameView",
        query: {
          ai: "true",
          deckId: selectedDeckId.value,
        },
      });
    };

    const notify = ref(false);
    watch(
      () => notify.value,
      async (val) => {
        if (!val) return;
        if (!("Notification" in window)) {
          toast.error("Your browser does not support notifications!");
        } else if (Notification.permission === "granted") return;
        else {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error(
              "Notification permission was denied. You can enable them for this site from your browser settings"
            );
            notify.value = false;
          }
        }
      }
    );

    const joinQueue = () => {
      if (!selectedDeckId.value) return;
      inQueue.value = true;
      queue(
        selectedDeckId.value,
        customQueueName.value,
        () => {
          if (Notification.permission === "granted" && notify.value)
            new Notification("Game found");
          router.push({ name: "GameView" });
        },
        (res) => {
          inQueue.value = false;
          toast.error(res.error || "There was an error");
          console.log(res.error);
        }
      );
    };

    const recentGames = ref<GameRecord[]>([]);
    const loadRecentGames = async () => {
      const result = await userService.getRecentGames();
      recentGames.value.push(...result);
    };
    loadRecentGames();

    return {
      decks,
      joinQueue,
      notify,
      playIndex,
      playTabs,
      singlePlayer,
      inQueue,
      selectedDeckId,
      user,
      numOnline,
      customQueueName,
      logout,
      recentGames,
    };
  },
});
</script>

<style scoped>
#dashboard {
  max-width: 1000px;
}

#dashboard h1.title {
  font-size: 3rem;
  color: var(--yellow-primary);
  margin-top: 2rem;
  text-align: center;
}

.section {
  background: var(--bg-secondary);
  padding: 1rem;
  margin-bottom: 2rem;
}

.decks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.decks-header .right {
  display: flex;
  align-items: center;
}
.decks-header .right > * {
  margin-left: 1rem;
}

.num-online {
  display: inline-block;
}

.account-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.account-info > div {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.decks {
  background: var(--bg-secondary);
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.decks > div {
  margin-right: 1rem;
}

.add-deck {
  background: var(--bg-tertiary);
  width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-bottom: 1rem;
}
.add-deck-plus {
  font-size: 70px;
  margin-bottom: 1rem;
}

.deck {
  border: 1px solid;
  border-color: transparent;
  padding: 0.2rem;
  cursor: pointer;
}

.deck .deck-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.deck.selected-deck {
  border-color: var(--yellow-primary);
}

.deck .deck-edit {
  background: var(--bg-tertiary);
  padding: 0.2rem;
}

.decks .monkey-img {
  max-width: 200px;
}

.play-options {
  margin-bottom: 2rem;
}

.queue-options-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.queue-button-container {
  margin: 2rem;
  margin-right: 0rem;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.notify-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

table {
  width: 100%;
  margin: auto;
}
</style>
