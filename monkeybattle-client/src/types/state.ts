import { Player, GameState } from "monkeybattle-shared";
import { Card } from "./card";

interface ClientPlayer extends Player {
  deckNum: number;
  hand: Card[];
  board: Card[];
}

export class ClientGameState extends GameState {
  player: ClientPlayer;
  opponent: ClientPlayer;
  playerTurn: number;

  constructor(state: GameState, playerId: number) {
    super(state.player1, state.player2, state.stage);

    if (this.player1.user.id === playerId) {
      this.player = this.player1 as ClientPlayer;
      this.opponent = this.player2 as ClientPlayer;
      this.playerTurn = 0;
    } else {
      this.player = this.player2 as ClientPlayer;
      this.opponent = this.player1 as ClientPlayer;
      this.playerTurn = 1;
    }
  }
}
