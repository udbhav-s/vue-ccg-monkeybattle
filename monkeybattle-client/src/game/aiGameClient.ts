/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  AddPlayer,
  Game,
  Player,
  SelectableTarget,
  Triggers,
  makeNextMove,
} from "monkeybattle-shared";
import EventEmitter from "eventemitter3";
import { ClientGameState } from "@/types/state";
import { reactive } from "vue";
import { Card } from "@/types";
import { serverCallback } from "./gameClient";
import { defaultAiUser } from "./defaultDeck";

export type AiGame = Game & { state: ClientGameState; endInfo: undefined };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const useAiGame = (player: AddPlayer, ai?: AddPlayer) => {
  const game = reactive(new Game(player, ai ? ai : defaultAiUser)) as AiGame;
  game.state = new ClientGameState(game.state, player.user.id);
  const eventEmitter = new EventEmitter();

  const destroyGame = () => {
    game.actions.removeAllListeners();
    game.eventEmitter.removeAllListeners();
  };

  // AI
  game.eventEmitter.on(
    Triggers.TurnStartTrigger,
    async ({ player }: { player: Player }) => {
      if (player.user.id === game.state.opponent.user.id) {
        // play delay
        await sleep(1500);

        // loop until no valid moves
        let result = true;
        while (result) {
          result = makeNextMove(game.state.opponent, game);
          await sleep(2000);
        }
        game.doneTurn(game.state.opponent);
      }
    }
  );

  // EVENT HANDLERS

  game.actions.on("roundStart", (round: number) => {
    eventEmitter.emit("roundStart", round);
  });

  game.actions.on("creaturePlayed", (data: { target?: string }) => {
    eventEmitter.emit("creaturePlayed", data);
  });

  game.actions.on(
    "spellPlayed",
    (data: { user: string; card: Card; target?: string }) => {
      eventEmitter.emit("spellPlayed", data);
    }
  );

  game.actions.on(
    "creatureAttack",
    (data: { attackingUid: string; attacked: SelectableTarget }) => {
      eventEmitter.emit("creatureAttack", data);
    }
  );

  // PLAYER ACTIONS

  const ready = (): void => {
    game.state.player.ready = true;
    game.state.opponent.ready = true;
    game.pickCards();
  };

  const reshuffle = (cb?: serverCallback): void => {
    try {
      game.reshuffle(game.state.player);
      if (cb) cb({ success: true });
    } catch (e) {
      if (cb && e instanceof Error) cb({ error: e.message });
    }
  };

  const doneTurn = (): void => {
    game.doneTurn(game.state.player);
  };

  const acceptPickedCards = (): void => {
    game.acceptCards(game.state.player);
    game.acceptCards(game.state.opponent);
  };

  const playSpell = (
    uid: string,
    target?: string,
    cb?: serverCallback
  ): void => {
    try {
      game.playSpell(game.state.player, { uid, target: target as string });
      if (cb) cb({ success: true });
    } catch (e) {
      if (cb && e instanceof Error) cb({ error: e.message });
    }
  };

  const playCreature = (
    uid: string,
    target?: string,
    cb?: serverCallback
  ): void => {
    console.log("play creautre");
    console.log(uid);
    try {
      game.playCreature(game.state.player, { uid, target: target as string });
      if (cb) cb({ success: true });
    } catch (e) {
      if (cb && e instanceof Error) cb({ error: e.message });
    }
  };

  const attack = (uid: string, target: string, cb?: serverCallback): void => {
    try {
      game.attack(game.state.player, { uid, target: target as string });
      if (cb) cb({ success: true });
    } catch (e) {
      if (cb && e instanceof Error) cb({ error: e.message });
    }
  };

  return {
    game,
    eventEmitter,
    ready,
    reshuffle,
    acceptPickedCards,
    doneTurn,
    playSpell,
    playCreature,
    attack,
    destroyGame,
  };
};
