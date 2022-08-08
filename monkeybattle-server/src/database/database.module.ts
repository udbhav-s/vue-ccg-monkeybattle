import { Global, Module, Provider } from '@nestjs/common';
import { Knex, knex } from 'knex';
import { Model } from 'objection';
import * as KnexConfig from '../../knexfile';
import { CardModel } from './models/card.model';
import { GameClassModel } from './models/gameClass.model';
import { DeckModel } from './models/deck.model';
import { MonkeyModel } from './models/monkey.model';
import { UserModel } from './models/user.model';
import { CardDeckModel } from './models/cardDeck.model';
import { GameRecordModel } from './models/gameRecord.model';

const models = [
  UserModel,
  CardModel,
  DeckModel,
  CardDeckModel,
  MonkeyModel,
  GameClassModel,
  GameRecordModel,
];

const modelProviders = models.map((model) => {
  return {
    provide: model.name,
    useValue: model,
  };
});

const providers = [
  ...modelProviders,
  {
    provide: 'KnexConnection',
    useFactory: async () => {
      const knexInstance: Knex = knex(KnexConfig);

      Model.knex(knexInstance);
      return knexInstance;
    },
  },
];

@Global()
@Module({
  providers: [...providers] as Provider<any>[],
  exports: [...providers] as Provider<any>[],
})
export class DatabaseModule {}
