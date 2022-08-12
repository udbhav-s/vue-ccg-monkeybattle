/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { SelectableTarget, User, GameState } from "monkeybattle-shared";
import { Card } from "@/types";
import { reactive } from "@vue/reactivity";
import { userStore } from "../store";
import { socket } from "../services/game.service";
import EventEmitter from "eventemitter3";
import { ClientGameState } from "@/types/state";
import * as jsonpatch from "fast-json-patch";

export type serverCallback = (response: {
  success?: boolean;
  error?: string;
}) => void;

interface GameEndInfo {
  levelStats: User;
}

export interface ClientGame {
  state: ClientGameState;
  endInfo: GameEndInfo;
}

export const useClientGame = async () => {
  const game = reactive<ClientGame>({
    state: {} as ClientGameState,
    endInfo: {} as GameEndInfo,
  });
  const eventEmitter = new EventEmitter();

  const getState = (): Promise<GameState | { error: string }> => {
    return new Promise((resolve) => {
      socket.emit("getState", (response: GameState) => {
        resolve(response);
      });
    });
  };

  // The creaturePlayed notification can be sent before the accompanying updateState
  // in this case, doing a DOM operation related to the card in a creaturePlayed handler can fail
  // this array holds update handles that are executed on receiving each updateState
  // so a creaturePlayed handler can attach a callback to execute after updateState has been received
  const onUpdateHandlers = [] as ((data: jsonpatch.Operation[] | undefined) => void)[];

  // initialise game state
  const stateResponse = await getState();
  if ("error" in stateResponse) throw new Error(stateResponse.error);
  game.state = new ClientGameState(stateResponse, userStore.getters.user().id);
  game.endInfo = {} as GameEndInfo;

  // REGISTER SOCKET EVENT HANDLERS

  // patch state
  // patches to player1/player2 should apply to player/opponent references
  socket.on("updateState", (patches: jsonpatch.Operation[]) => {
    game.state = jsonpatch.applyPatch(game.state, patches).newDocument;
    onUpdateHandlers.forEach((f) => f(patches));
    onUpdateHandlers.length = 0;
  });

  socket.on("creaturePlayed", (data: { target?: string }) => {
    eventEmitter.emit("creaturePlayed", data);
  });

  socket.on("roundStart", (round: number) => {
    eventEmitter.emit("roundStart", round);
  });

  socket.on(
    "spellPlayed",
    (data: { user: string; card: Card; target?: string }) => {
      eventEmitter.emit("spellPlayed", data);
    }
  );

  socket.on(
    "creatureAttack",
    (data: { attackingUid: string; attacked: SelectableTarget }) => {
      eventEmitter.emit("creatureAttack", data);
    }
  );

  socket.on("levelStats", (data: User) => {
    game.endInfo.levelStats = data;
  });

  socket.on("warnIdle", () => {
    eventEmitter.emit("warnIdle");
  });

  const destroyGame = () => {
    for (const event of [
      "updateState",
      "creaturePlayed",
      "roundStart",
      "spellPlayed",
      "creatureAttack",
      "levelStats",
    ])
      socket.removeAllListeners(event);
  };

  // PLAYER ACTIONS

  const ready = async () => {
    await socket.emit("ready");
  };

  const reshuffle = async (cb?: serverCallback) => {
    if (
      game.state.player.allowedShuffles &&
      game.state.player.allowedShuffles > 0
    ) {
      await socket.emit("reshuffle", cb);
    }
  };

  const doneTurn = async () => {
    await socket.emit("doneTurn");
  };

  const acceptPickedCards = async () => {
    if (!game.state.player.cardsPicked) {
      await socket.emit("acceptPickedCards");
    }
    console.log("accepted picked cards");
  };

  const playSpell = async (
    uid: string,
    target?: string,
    cb?: serverCallback
  ) => {
    await socket.emit(
      "playSpell",
      {
        uid,
        target,
      },
      cb
    );
  };

  const playCreature = async (
    uid: string,
    target?: string,
    cb?: serverCallback
  ) => {
    await socket.emit(
      "playCreature",
      {
        uid,
        target,
      },
      cb
    );
  };

  const attack = async (uid: string, target: string, cb?: serverCallback) => {
    await socket.emit("attack", {
      uid,
      target,
      cb,
    });
  };

  return {
    game,
    eventEmitter,
    onUpdateHandlers,
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
