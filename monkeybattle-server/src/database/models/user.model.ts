import { BaseModel } from './base.model';
import { Model } from 'objection';
import { CardModel } from './card.model';
import { DeckModel } from './deck.model';
import { MonkeyModel } from './monkey.model';

export class UserModel extends BaseModel {
  static tableName = 'users';

  id!: number;
  username!: string;
  password?: string;
  level!: number;
  xp!: number;

  cards?: CardModel[];
  decks?: DeckModel[];
  monkeys?: MonkeyModel[];

  static relationMappings = () => ({
    cards: {
      modelClass: CardModel,
      relation: Model.ManyToManyRelation,
      join: {
        from: 'users.id',
        through: {
          from: 'usersCards.userId',
          to: 'usersCards.cardId',
          extra: ['count'],
        },
        to: 'cards.id',
      },
    },
    decks: {
      modelClass: DeckModel,
      relation: Model.HasManyRelation,
      join: {
        from: 'users.id',
        to: 'decks.userId',
      },
    },
    monkeys: {
      modelClass: MonkeyModel,
      relation: Model.ManyToManyRelation,
      join: {
        from: 'users.id',
        through: {
          from: 'usersMonkeys.userId',
          to: 'usersMonkeys.monkeyId',
        },
        to: 'monkeys.id',
      },
    },
  });
}
