<template>
  <div id="leaderboard">
    <h1>Leaderboard</h1>

    <Tabs
      class="leaderboard-tabs"
      :tabs="tabs"
      v-model:selectedIndex="selectedIndex"
    />

    <table>
      <tr class="head">
        <th>Position</th>
        <th>Username</th>
        <th>XP Gained</th>
      </tr>

      <tr v-for="(user, i) in users" :key="user.id">
        <td>{{ i + 1 }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.winningXp }}</td>
      </tr>
    </table>

    <div style="text-align: center">
      <button @click="getUsers" :disabled="reachedEnd" class="button outlined">
        Load more
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { LeaderboardUser } from "@/types";
import { userService } from "@/services/user.service";
import Tabs from "@/components/UI/Tabs.vue";

export default defineComponent({
  name: "Leaderboard",
  components: {
    Tabs,
  },

  setup() {
    const users = ref<LeaderboardUser[]>([]);
    const limit = 20;
    let offset = 0;
    const reachedEnd = ref(false);

    const tabs = ref([
      { text: "Last Week", data: 7 },
      { text: "Last Month", data: 31 },
      { text: "Last Year", data: 365 },
    ]);
    const selectedIndex = ref(0);
    const n = computed(() => tabs.value[selectedIndex.value].data);

    const getUsers = async () => {
      const result = await userService.getTopByXp(limit, offset, n.value);
      users.value.push(...result);
      if (result.length < limit) reachedEnd.value = true;
      offset += limit;
    };
    getUsers();

    watch(
      () => n.value,
      () => {
        reachedEnd.value = false;
        users.value = [];
        offset = 0;
        getUsers();
      }
    );

    return {
      users,
      getUsers,
      tabs,
      reachedEnd,
      selectedIndex,
    };
  },
});
</script>

<style>
#leaderboard {
  max-width: 768px;
  margin: auto;
  padding: 0 1rem;
}

#leaderboard h1 {
  text-align: center;
  color: var(--yellow-primary);
  margin-top: 2rem;
}

#leaderboard table {
  width: 100%;
  margin-bottom: 2rem;
}

.leaderboard-tabs {
  margin-bottom: 2rem;
}
</style>
