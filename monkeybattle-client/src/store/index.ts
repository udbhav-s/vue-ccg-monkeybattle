/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Card, Deck, UserStore } from "@/types";
import { Monkey, User } from "monkeybattle-shared";
import { reactive } from "vue";

export const store = reactive({
  user: {} as UserStore,
  monkeys: [] as Monkey[],
  cards: [] as Card[],
  decks: [] as Deck[],
});

export const userStore = {
  getters: {
    user: () => store.user.data,
    isAuthenticated: () => store.user.data && store.user.data.id,
  },

  mutations: {
    setUser(user: User) {
      store.user.data = user;
    },

    logout() {
      store.user = {} as UserStore;
    },
  },
};

export const monkeyStore = {
  getters: {
    monkeys: () => store.monkeys,
  },

  mutations: {
    setMonkeys(monkeys: Monkey[]) {
      store.monkeys = monkeys;
    },
  },
};

export const deckStore = {
  getters: {
    decks: () => store.decks,
  },

  mutations: {
    setDecks(decks: Deck[]) {
      store.decks = decks;
    },
  },
};
