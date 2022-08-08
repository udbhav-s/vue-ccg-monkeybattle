/* eslint-disable @typescript-eslint/no-var-requires */
import { knex } from 'knex';
import * as KnexConfig from '../../../knexfile';

const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const knexInstance = knex(KnexConfig);

const store = new KnexSessionStore({ knex: knexInstance });
export const sessionMiddleware = session({
  secret: 'ok',
  resave: false,
  saveUninitialized: false,
  store,
});

const wrap = (middleware: any) => (socket: any, next: any) =>
  middleware(socket.request, {}, next);

export const socketSessionMiddleware = wrap(sessionMiddleware);
