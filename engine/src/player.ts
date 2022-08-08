import { GameCard } from './gameCard';
import { Monkey } from './monkey';
import { User } from './user';

export class Player {
  user: User;

  bananas = 0;
  monkeyHealth: number;
  monkey: Monkey;
  deck: GameCard[] = [];
  hand: GameCard[] = [];
  board: GameCard[] = [];
  dead: GameCard[] = [];

  handNum?: number;
  deckNum?: number;

  pickCards: GameCard[] = [];
  cardsPicked = false;
  ready = false;
  allowedShuffles?: number;
  fatigue = 0;

  constructor(user: User, monkey: Monkey, monkeyHealth: number) {
    this.user = user;
    this.monkey = monkey;
    this.monkeyHealth = monkeyHealth;
  }
}
