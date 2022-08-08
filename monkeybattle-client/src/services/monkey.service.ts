import { monkeyStore } from "@/store";
import { Monkey } from "monkeybattle-shared";
import api from "./api.service";

export const monkeyService = {
  async updateStoreMonkeys(): Promise<void> {
    const monkeys = await api.get<Monkey[]>("/monkey");
    monkeyStore.mutations.setMonkeys(monkeys);
  },
};
