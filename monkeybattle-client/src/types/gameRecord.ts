import { User } from "monkeybattle-shared";

export interface GameRecord {
  winner: User;
  loser: User;
  winningXp: number;
  losingXp: number;
}
