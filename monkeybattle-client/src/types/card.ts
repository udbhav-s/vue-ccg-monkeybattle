import { GameCard } from "monkeybattle-shared";

export interface Card extends GameCard {
  uid: string;
  id: number;
  count: number;

  gameClassId: number;
  handSelected?: boolean;
  boardSelected?: boolean;
}
