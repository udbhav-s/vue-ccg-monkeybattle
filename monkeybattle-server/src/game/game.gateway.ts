import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { GameRecordModel } from '../database/models/gameRecord.model';
import { ModelClass } from 'objection';
import { Server, Socket } from 'socket.io';
import { SessionSocket } from 'src/common/types/sessionSocket';
import { socketSessionMiddleware } from 'src/common/util/session';
import { DeckService } from 'src/deck/deck.service';
import { UserService } from 'src/user/user.service';
import { uid } from 'uid';
import { GameRoom } from './gameRoom';

@WebSocketGateway()
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  queue: SessionSocket[] = [];
  customQueue: Map<string, SessionSocket> = new Map();
  games: Map<string, GameRoom> = new Map();
  io!: Server;
  logger: Logger;

  constructor(
    private readonly userService: UserService,
    private readonly deckService: DeckService,
    @Inject('GameRecordModel')
    private readonly gameRecordModel: ModelClass<GameRecordModel>,
  ) {
    this.logger = new Logger('GameGateway');
  }

  afterInit(server: Server) {
    GameRoom.io = server;
    this.io = server;
    server.use(socketSessionMiddleware);
    server.use((sckt: Socket, next) => {
      const socket = sckt as SessionSocket;
      const userId = socket.request.session?.passport.user;
      if (userId) {
        this.userService
          .getById(userId)
          .then((user) => {
            if (!user) throw new Error('User not found');
            socket.user = user;
            next();
          })
          .catch(() => {
            next(new Error('Could not fetch user'));
          });
      } else {
        next(new UnauthorizedException('Not logged in'));
      }
    });
  }

  startGame(gameId: string, client1: SessionSocket, client2: SessionSocket) {
    // set sockets inGame
    client1.inGame = true;
    client2.inGame = true;
    // create game instance
    this.games.set(
      gameId,
      new GameRoom(client1, client2, gameId, this.afterGame.bind(this)),
    );
  }

  @SubscribeMessage('queue')
  async queueUser(
    client: SessionSocket,
    payload: { deckId: number; custom?: string },
  ) {
    if (!payload.deckId) return;
    if (this.queue.find((c) => c.user.id === client.user.id)) {
      return {
        error: 'Account already in queue!',
      };
    }
    if (client.inGame)
      return {
        error: 'Account already in game!',
      };

    const deck = (
      await this.deckService.get(payload.deckId, client.user.id, true)
    )[0];
    if (!deck) {
      return {
        error: 'Deck not found',
      };
    }
    if (deck.getNumCards() < 18) {
      return {
        error: 'Deck must have at least 18 cards!',
      };
    }

    client.deck = deck;

    // custom room
    if (payload.custom && typeof payload.custom === 'string') {
      const customId = 'custom_' + payload.custom;
      if (payload.custom.length > 20) {
        return {
          error: 'Custom room name must be 20 characters or less',
        };
      }
      if (this.customQueue.has(customId)) {
        const otherClient = this.customQueue.get(customId) as SessionSocket;
        const roomId = uid();
        client.join(roomId);
        otherClient.join(roomId);

        // start game
        this.startGame(roomId, client, otherClient);

        // remove players from custom queue
        this.customQueue.delete(customId);

        this.logger.debug(
          `Created custom game ${customId} with ${client.user.username} and ${otherClient.user.username}`,
        );
      } else {
        this.customQueue.set(customId, client);
        this.logger.debug(
          `Added ${client.user.username} in custom room ${customId}`,
        );
      }
      return;
    }

    if (this.queue.length === 0) {
      this.queue.push(client);
      this.logger.debug(`Queue empty, added ${client.user.username}`);
    } else {
      const otherClient = this.queue.shift() as SessionSocket;
      const gameId = uid();
      this.logger.debug(
        `Matching ${otherClient.user.username} with ${client.user.username} in ${gameId}, queue length ${this.queue.length}`,
      );
      // join sockets to new room
      client.join(gameId);
      otherClient.join(gameId);
      // create a game
      this.startGame(gameId, client, otherClient);
    }
  }

  @SubscribeMessage('getState')
  getStateHandler(client: SessionSocket) {
    if (!client.inGame) {
      return {
        error: 'Client is not in game',
      };
    }
  }

  @SubscribeMessage('getNumOnline')
  getNumOnline() {
    return {
      numOnline: this.io.engine.clientsCount,
    };
  }

  handleConnection(client: SessionSocket) {
    console.log('New connection: ' + client.user.username);
    this.io.sockets.emit('numOnline', {
      numOnline: this.io.engine.clientsCount,
    });
  }

  handleDisconnect(client: SessionSocket) {
    this.queue = this.queue.filter((c) => c.id !== client.id);
    for (const [key, socket] of this.customQueue.entries()) {
      if (socket.id === client.id) this.customQueue.delete(key);
    }
    this.io.sockets.emit('numOnline', {
      numOnline: this.io.engine.clientsCount,
    });
  }

  async afterGame(
    id: string,
    winner: SessionSocket,
    loser: SessionSocket,
    disconnect?: boolean,
  ) {
    if (!this.games.has(id)) return;

    winner.inGame = false;
    loser.inGame = false;

    this.logger.debug('Winner of ' + id + ' : ' + winner.user.username);

    const winningXp = 100;
    let losingXp = 0;
    // level ups
    const winnerStats = await this.userService.addXP(winner.user.id, winningXp);
    winner.emit('levelStats', winnerStats);
    if (!disconnect) {
      losingXp = 40;
      const loserStats = await this.userService.addXP(loser.user.id, losingXp);
      loser.emit('levelStats', loserStats);
    }
    // add game record
    await this.gameRecordModel.query().insert({
      winnerId: winner.user.id,
      winningXp,
      loserId: loser.user.id,
      losingXp,
    });

    // delete game instance
    this.games.delete(id);
  }
}
