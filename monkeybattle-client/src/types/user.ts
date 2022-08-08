import { User } from "monkeybattle-shared";

export interface UserStore {
  data: User;
}

export interface LeaderboardUser extends User {
  winningXp: number;
}
