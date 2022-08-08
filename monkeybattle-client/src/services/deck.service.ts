/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { deckStore } from "@/store";
import { Deck } from "@/types";
import api from "./api.service";

type createDeck = {
  name: string;
  monkeyId: number;
};

type addDeckCard = {
  cardId: number;
  deckId: number;
};

export const deckService = {
  async updateStoreDecks() {
    const decks = await api.get<Deck[]>("/deck/all");
    deckStore.mutations.setDecks(decks);
  },

  async getDeckWithCards(deckId: number) {
    return await api.get<Deck>(`/deck/${deckId}`, {
      params: {
        cards: true,
      },
    });
  },

  async create(body: createDeck) {
    return await api.post<Deck>("/deck/new", body);
  },

  async addCard(body: addDeckCard) {
    return await api.post("/deck/add", body);
  },

  async removeCard(body: addDeckCard) {
    return await api.post("/deck/remove", body);
  },

  async delete(id: number) {
    return await api.delete(`/deck/${id}`);
  },

  async getAllUserCards() {
    return await api.get("/card/user");
  },
};
