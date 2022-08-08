import { BaseModel } from './base.model';
import { Model } from 'objection';
import { CardModel } from './card.model';
import { UserModel } from './user.model';
import { MonkeyModel } from './monkey.model';

export class DeckModel extends BaseModel {
  static tableName = 'decks';

  name!: string;

  userId!: number;
  monkeyId!: number;

  user!: UserModel;
  monkey!: MonkeyModel;
  cards!: CardModel[];

  getNumCards(): number {
    let numCards = 0;
    for (const card of this.cards) {
      if (card.count) numCards += card.count;
      else numCards += 1;
    }
    return numCards;
  }

  static relationMappings = () => ({
    user: {
      modelClass: UserModel,
      relation: Model.BelongsToOneRelation,
      join: {
        from: 'decks.userId',
        to: 'users.id',
      },
    },
    monkey: {
      modelClass: MonkeyModel,
      relation: Model.BelongsToOneRelation,
      join: {
        from: 'decks.monkeyId',
        to: 'monkeys.id',
      },
    },
    cards: {
      modelClass: CardModel,
      relation: Model.ManyToManyRelation,
      join: {
        from: 'decks.id',
        through: {
          from: 'cardsDecks.deckId',
          to: 'cardsDecks.cardId',
          extra: ['count'],
        },
        to: 'cards.id',
      },
    },
  });
}
