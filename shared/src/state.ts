import { Player } from './player';
import { GameStage } from './stage';

export class GameState {
  stage: GameStage;
  player1: Player;
  player2: Player;
  turn = 0;
  round = 0;

  winner?: number;
  gameData?: {
    opponentDisconnected: boolean;
  };

  constructor(p1: Player, p2: Player, stage?: GameStage) {
    this.player1 = p1;
    this.player2 = p2;
    this.stage = stage ?? GameStage.Pregame;
  }
}
