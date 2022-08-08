import type { IncomingMessage } from 'http';
import type { SessionData } from 'express-session';
import type { Socket } from 'socket.io';
import { UserModel } from 'src/database/models/user.model';
import { DeckModel } from 'src/database/models/deck.model';

interface SessionIncomingMessage extends IncomingMessage {
  session: SessionData;
}

export interface SessionSocket extends Socket {
  request: SessionIncomingMessage;
  user: UserModel;
  deck: DeckModel;
  inGame?: boolean;
  lastMoved: number;
}
