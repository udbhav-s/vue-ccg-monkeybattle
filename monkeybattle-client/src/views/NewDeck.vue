<template>
  <div class="container" id="new-deck">
    <h1 class="title">New Deck</h1>
    <div class="deck-form">
      <div class="field">
        <span class="label">Name: </span>
        <input type="text" v-model="deckName" />
      </div>
      <div class="field">
        Class: {{ selectedMonkey ? selectedMonkey.monkeyClass : "" }}
      </div>
      <div class="monkeys">
        <div
          v-for="monkey in monkeys"
          :key="monkey.id"
          @click="selectMonkey(monkey)"
          class="monkey"
          :class="{
            selected: selectedMonkey && selectedMonkey.id === monkey.id,
          }"
        >
          <ImageLoader
            class="monkey-img"
            :src="require('@/assets/images/monkeys/' + monkey.name + '.png')"
            :width="1200"
            :height="1600"
          />
        </div>
      </div>
      <div v-if="monkeys.length === 0">No monkeys</div>
      <div class="field">
        <button
          @click="createDeck"
          :disabled="!selectedMonkey"
          class="button outlined"
        >
          Create Deck
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import router from "@/router";
import { deckService } from "@/services/deck.service";
import { monkeyService } from "@/services/monkey.service";
import { monkeyStore } from "@/store";
import { Monkey } from "monkeybattle-shared";
import { computed, defineComponent, ref } from "vue";
import ImageLoader from "@/components/UI/ImageLoader.vue";

export default defineComponent({
  name: "NewDeck",
  components: {
    ImageLoader,
  },

  setup() {
    const deckName = ref("New Deck");
    monkeyService.updateStoreMonkeys();
    const monkeys = computed(monkeyStore.getters.monkeys);
    const selectedMonkey = ref<Monkey>();

    const selectMonkey = (monkey: Monkey) => (selectedMonkey.value = monkey);

    const createDeck = async () => {
      if (!selectedMonkey.value) return;
      const deck = await deckService.create({
        name: deckName.value,
        monkeyId: selectedMonkey.value.id,
      });

      router.push({ name: "DeckBuilder", params: { deckId: deck.id } });
    };

    return {
      deckName,
      monkeys,
      selectMonkey,
      selectedMonkey,
      createDeck,
    };
  },
});
</script>

<style>
#new-deck {
  max-width: 1000px;
}

#new-deck h1 {
  color: var(--yellow-primary);
  text-align: center;
  margin-top: 2rem;
}

.deck-form {
  background: var(--bg-secondary);
  padding: 1rem;
  margin-bottom: 2rem;
}

.deck-form .field {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  text-align: center;
}

.deck-form .field .label {
  margin-right: 1rem;
}

.deck-form .monkeys {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.monkey {
  margin: 1rem;
  border: 1px solid;
  border-color: transparent;
}

.monkey.selected {
  border-color: var(--yellow-primary);
}

.deck-form .monkey-img {
  max-width: 200px;
}
</style>
