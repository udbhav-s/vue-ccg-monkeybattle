import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { AddPlayer, Game, GameState, Player } from 'monkeybattle-shared';
import * as jsonpatch from 'fast-json-patch';
import cloneDeep from 'fast-copy';
import { SessionSocket } from 'src/common/types/sessionSocket';
import { throttle } from 'throttle-debounce';
import { watch } from './gameStateProxy';

export class GameRoom {
  static io: Server;
  endCallback: (
    id: string,
    winner: SessionSocket,
    loser: SessionSocket,
    disconnect?: boolean,
  ) => void;
  p1Socket!: SessionSocket;
  p2Socket!: SessionSocket;
  room: string;
  logger = new Logger('game');

  // kick idle players
  warnIdleAfter: number;
  kickIdleAfter: number;

  prevGameState!: GameState;
  game: Game;

  updateThrottleMs!: 3;

  constructor(p1: SessionSocket, p2: SessionSocket, rm: string, cb: any) {
    this.setRandomPlayers(p1, p2);
    this.endCallback = cb;
    this.room = rm;

    this.game = new Game(
      this.p1Socket as AddPlayer,
      this.p2Socket as AddPlayer,
    );
    this.updatePreviousState();
    this.makeStateReactive();

    this.warnIdleAfter = this.game.config.turnTimeout * 2.5;
    this.kickIdleAfter = this.game.config.turnTimeout * 4.5;

    this.logger.log(
      `Game created between ${p1.user.username} and ${p2.user.username}`,
    );

    this.initHandlers();

    // notify players of joined game
    this.emitEach('gameJoined', () => '');
  }

  updatePreviousState() {
    this.prevGameState = cloneDeep(this.game.state);
  }

  // remove player private properties before sending state
  getReducedState(s: GameState, player?: Player) {
    const state = cloneDeep(s);

    if (player) {
      const players =
        state.player1.user.id === player.user.id
          ? [state.player1, state.player2]
          : [state.player2, state.player1];

      // delete hand info for opponent
      players[1].handNum = players[1].hand.length;
      delete (players[1] as any).hand;

      // delete pick cards
      delete (players[1] as any).pickCards;
    } else {
      // for spectator - delete hand & pick info for both players
      for (const p of [state.player1, state.player2]) {
        p.handNum = p.hand.length;
        delete (p as any).hand;
        delete (p as any).pickCards;
      }
    }

    for (const p of [state.player1, state.player2]) {
      // delete deck info
      p.deckNum = p.deck.length;
      delete (p as any).deck;
      delete (p as any).dead;

      // remove Dates from user models
      // cannot be converted into JSON and give errors with jsonpatch
      delete (p as any).user.createdAt;
      delete (p as any).user.updatedAt;
    }

    return state;
  }

  // Create reduced versions of previous and current state (for the relevant client)
  // Generate a JSON Patch of the changes in reduced state and send to client
  getPatchedState(ps?: SessionSocket): jsonpatch.Operation[] {
    let player;
    if (ps)
      player =
        ps.user.id === this.game.state.player1.user.id
          ? this.game.state.player1
          : this.game.state.player2;

    const patch = jsonpatch.compare(
      this.getReducedState(this.prevGameState, player),
      this.getReducedState(this.game.state, player),
    );

    return patch;
  }

  makeStateReactive() {
    const stateChangeHandler = throttle(this.updateThrottleMs, () => {
      this.p1Socket.emit('updateState', this.getPatchedState(this.p1Socket));
      this.p2Socket.emit('updateState', this.getPatchedState(this.p2Socket));
      // this.patchState(); todo - match spectators
      this.updatePreviousState();
    });

    this.game.state = watch(this.game.state, stateChangeHandler);
  }

  setRandomPlayers(p1: SessionSocket, p2: SessionSocket) {
    const flip = Math.random() > 0.5;
    if (flip) {
      this.p1Socket = p1;
      this.p2Socket = p2;
    } else {
      this.p1Socket = p2;
      this.p2Socket = p1;
    }
  }

  on(event: string, callback: any) {
    this.p1Socket.on(event, (...args: any[]) => {
      callback(this.game.state.player1, ...args);
    });
    this.p2Socket.on(event, (...args: any[]) => {
      callback(this.game.state.player2, ...args);
    });
  }

  off(event: string) {
    this.p1Socket.removeAllListeners(event);
    this.p2Socket.removeAllListeners(event);
  }

  emitEach(event: string, getData: any) {
    this.p1Socket.emit(event, getData(this.game.state.player1));
    this.p2Socket.emit(event, getData(this.game.state.player2));
  }

  setLastMoved(userId: number) {
    const pSocket =
      this.p1Socket.user.id === userId ? this.p1Socket : this.p2Socket;
    pSocket.lastMoved = Date.now();
  }

  initHandlers() {
    // send full state
    this.on('getState', (player: Player, callback: any) => {
      const state = this.getReducedState(this.prevGameState, player);
      callback(state);
    });

    // players ready - start game with pick cards stage
    this.on('ready', (player: Player) => {
      player.ready = true;
      if (this.game.state.player1.ready && this.game.state.player2.ready) {
        this.off('ready');
        this.game.pickCards();
      }
      this.setLastMoved(player.user.id);
    });

    // reshuffle picked cards
    this.on('reshuffle', (p: Player, cb?: any) => {
      try {
        this.game.reshuffle(p);
        if (cb) cb({ success: true });
      } catch (e) {
        if (cb)
          cb({ error: e instanceof Error ? e.message : 'There was an error' });
      }
    });

    // pick cards
    this.on('acceptPickedCards', this.game.acceptCards.bind(this.game));

    // disconnect handler
    this.on('disconnect', this.game.disconnect.bind(this.game));

    // game end handler
    this.game.actions.on('victory', (data) => {
      const sockets =
        data.player.user.id === this.p1Socket.user.id
          ? [this.p1Socket, this.p2Socket]
          : [this.p2Socket, this.p1Socket];
      this.endCallback(this.room, sockets[0], sockets[1], data.disconnect);
    });

    // check for idle
    this.game.actions.on('turnStart', () => {
      const t = Date.now();
      if (t - this.p1Socket.lastMoved > this.kickIdleAfter)
        this.game.disconnect(this.game.state.player1);
      else if (t - this.p2Socket.lastMoved > this.kickIdleAfter)
        this.game.disconnect(this.game.state.player2);

      if (t - this.p1Socket.lastMoved > this.warnIdleAfter)
        this.p1Socket.emit('warnIdle');
      else if (t - this.p2Socket.lastMoved > this.warnIdleAfter)
        this.p2Socket.emit('warnIdle');
    });

    // round start
    this.game.actions.on('roundStart', (round) => {
      GameRoom.io.to(this.room).emit('roundStart', round);
    });

    // creature played
    this.game.actions.on('creaturePlayed', (data) => {
      GameRoom.io.to(this.room).emit('creaturePlayed', data);
      this.setLastMoved(data.user);
    });

    // spell played
    this.game.actions.on('spellPlayed', (data) => {
      GameRoom.io.to(this.room).emit('spellPlayed', data);
      this.setLastMoved(data.user);
    });

    // creature attack
    this.game.actions.on('creatureAttack', (data) => {
      GameRoom.io.to(this.room).emit('creatureAttack', data);
      this.setLastMoved(data.user);
    });

    // PLAYER ACTIONS

    // play spell
    this.on('playSpell', (player: Player, data: any, cb?: any) => {
      try {
        this.game.playSpell(player, data);
        if (cb) cb({ success: true });
      } catch (e) {
        if (cb)
          cb({ error: e instanceof Error ? e.message : 'An error occured' });
      }
    });

    // play creature
    this.on('playCreature', (player: Player, data: any, cb?: any) => {
      try {
        this.game.playCreature(player, data);
        if (cb) cb({ success: true });
      } catch (e) {
        if (cb)
          cb({ error: e instanceof Error ? e.message : 'An error occured' });
      }
    });

    // attack
    this.on('attack', (player: Player, data: any, cb?: any) => {
      try {
        this.game.attack(player, data);
        if (cb) cb({ success: true });
      } catch (e) {
        if (cb)
          cb({ error: e instanceof Error ? e.message : 'An error occured' });
      }
    });

    // finish turn
    this.on('doneTurn', this.game.doneTurn.bind(this.game));
  }
}
