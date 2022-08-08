<template>
  <div class="deck-builder-view" v-if="deck && deck.name">
    <div class="deck-builder-header">
      <h1 class="title">{{ deck.name }}</h1>
      <router-link to="/dashboard" class="button outlined">
        Back To Dashboard
      </router-link>
    </div>
    <div class="deck-builder-info">
      <div class="monkey-info">
        {{ deck.monkey.name }} ({{ deck.monkey.gameClass?.name }})
      </div>
      <div class="card-num">{{ deckLength }} / 20</div>
    </div>

    <div class="deck-builder">
      <div class="all-cards">
        <div v-for="card in userCards" :key="card.id">
          <Card
            :card="card"
            @click="addCard(card)"
            :class="{ 'not-addable': !addableToDeck(card) }"
          />
          <div class="card-count">{{ remainingCount(card) }}</div>
        </div>
      </div>
      <div class="deck-cards">
        <template v-for="card in deck.cards" :key="card.id">
          <div
            @click="removeCard(card.id)"
            v-for="i in card.count"
            :key="i"
            class="deck-card-container"
          >
            <Card :card="card" />
          </div>
        </template>
      </div>
    </div>
  </div>
  <div v-else>
    <h1 class="title">Loading</h1>
  </div>
</template>

<script lang="ts">
import { deckService } from "@/services/deck.service";
import { Card, Deck } from "@/types";
import { defineComponent } from "@vue/runtime-core";
import { computed, onMounted, ref } from "vue";
import CardComponent from "./game/Card.vue";

export default defineComponent({
  name: "DeckBuilder",
  props: {
    deckId: {
      type: Number,
      required: true,
    },
  },
  components: {
    Card: CardComponent,
  },

  setup(props) {
    let deck = ref<Deck>({} as Deck);
    onMounted(async () => {
      deck.value = await deckService.getDeckWithCards(props.deckId);
    });
    const deckLength = computed(() => {
      let sum = 0;
      for (const card of deck.value.cards) {
        sum += card.count;
      }
      return sum;
    });

    let cards = ref<Card[]>([]);
    deckService.getAllUserCards().then((res) => (cards.value = res));

    const remainingCount = (card: Card): number => {
      if (typeof card.count === "undefined") card.count = 1;
      if (!deck.value) return 0;
      const deckCard = deck.value.cards.find((c) => c.id === card.id);
      if (!deckCard) return card.count;
      else return card.count - deckCard.count;
    };

    const addableToDeck = (card: Card) => {
      const deckCard = deck.value.cards.find((c) => c.id === card.id);
      return (
        remainingCount(card) > 0 &&
        (!card.gameClassId ||
          card.gameClassId === deck.value.monkey.gameClassId) &&
        (!deckCard || deckCard.count === 1)
      );
    };

    const removeCard = async (cardId: number) => {
      try {
        await deckService.removeCard({
          cardId,
          deckId: deck.value.id,
        });

        deck.value.cards = deck.value.cards
          .map((c) => {
            if (c.id === cardId) {
              c.count--;
              return c;
            } else return c;
          })
          .filter((c) => c.count > 0);
      } catch (e) {
        console.log(e);
      }
    };

    const addCard = async (card: Card) => {
      if (!addableToDeck(card)) return;
      if (deck.value.cards.length >= 20) return;
      try {
        await deckService.addCard({
          cardId: card.id,
          deckId: deck.value.id,
        });

        const deckCard = deck.value.cards.find((c) => c.id === card.id);
        if (!deckCard)
          deck.value.cards.push({
            ...card,
            count: 1,
          });
        else deckCard.count++;
      } catch (e) {
        console.log(e);
      }
    };

    return {
      deck,
      userCards: cards,
      remainingCount,
      addableToDeck,
      removeCard,
      addCard,
      deckLength,
    };
  },
});
</script>

<style>
.deck-builder-view {
  width: 100%;
  height: 100vh;
}

.deck-builder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.deck-builder-header > * {
  margin: 1rem;
}
.deck-builder-header > h1 {
  color: var(--yellow-primary);
  margin-top: 1.5rem;
}

.deck-builder-info {
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.deck-builder-info > * {
  margin: 1rem;
}

.deck-builder .all-cards {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
  max-height: inherit;
  margin-bottom: 350px;
}

.deck-cards {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  overflow-x: auto;
  background: var(--bg-tertiary);
  border-radius: 5px;
  padding-top: 0.2rem;
}
.deck-cards::-webkit-scrollbar {
  background-color: var(--bg-secondary);
  height: 10px;
}
.deck-cards::-webkit-scrollbar-thumb {
  background-color: var(--yellow-primary);
}

.deck-cards .card {
  flex: none;
}

.card.not-addable {
  opacity: 0.5;
}

.card-count {
  text-align: center;
}

.deck-builder .card {
  width: 200px;
  font-size: 20px;
  margin: 0.5rem;
}
</style>
