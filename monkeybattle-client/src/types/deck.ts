import { Card } from "./card";
import { Monkey } from "monkeybattle-shared";

export interface Deck {
  id: number;
  name: string;
  monkeyId?: number;

  monkey: Monkey;
  cards: Card[];
}
