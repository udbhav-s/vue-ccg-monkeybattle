/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import router from "@/router";
import { userStore } from "@/store";
import { User } from "monkeybattle-shared";

import api from "./api.service";

import { LeaderboardUser } from "@/types";
import { GameRecord } from "@/types/gameRecord";

export const userService = {
  async setStoreUser(): Promise<void> {
    try {
      const user = await api.get<User>("/user/self");
      userStore.mutations.setUser(user);
    } catch (e) {
      router.push("/");
    }
  },

  async register(username: string, password: string) {
    await api.post<number>("/user/register", {
      username: username.trim(),
      password: password.trim(),
    });
  },

  async login(username: string, password: string) {
    const user = await api.post<User>("/user/login", {
      username: username.trim(),
      password: password.trim(),
    });
    userStore.mutations.setUser(user);
  },

  async logout() {
    return await api.post("/user/logout");
  },

  async getAll(limit = 20, offset = 0) {
    return await api.get<User[]>("/user/all", {
      params: {
        limit,
        offset,
        orderBy: "xp",
        order: "desc",
      },
    });
  },

  async getTopByXp(limit = 20, offset = 0, n = 7) {
    return await api.get<LeaderboardUser[]>("game-record/leaderboard", {
      params: {
        limit,
        offset,
        n,
      },
    });
  },

  async getRecentGames() {
    return await api.get<GameRecord[]>("game-record", {
      params: { n: 5 },
    });
  },
};
