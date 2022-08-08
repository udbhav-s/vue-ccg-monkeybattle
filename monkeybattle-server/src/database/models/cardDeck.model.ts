import { BaseModel } from './base.model';

export class CardDeckModel extends BaseModel {
  static tableName = 'cardsDecks';

  cardId!: number;
  deckId!: number;
  count!: number;

  static modifiers = {
    ...BaseModel.modifiers,
  };
}
