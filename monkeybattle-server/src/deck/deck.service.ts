import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';
import { CardModel } from 'src/database/models/card.model';
import { DeckModel } from 'src/database/models/deck.model';
import { AddDeck } from 'src/game/starter/starterCards';

@Injectable()
export class DeckService {
  constructor(
    @Inject('DeckModel') private deckModel: ModelClass<DeckModel>,
    @Inject('CardModel') private cardModel: ModelClass<CardModel>,
  ) {}

  async get(
    deckId?: number,
    userId?: number,
    withCards?: boolean,
  ): Promise<DeckModel[]> {
    const query = this.deckModel.query();
    if (deckId) query.where({ id: deckId });
    if (userId) query.where({ userId });
    if (withCards) query.withGraphFetched('[cards]');
    query.withGraphFetched('[monkey.[gameClass]]');
    return await query;
  }

  async getCards(
    deckId: number,
    cardId?: number,
  ): Promise<CardModel[] | CardModel> {
    const query = this.deckModel.relatedQuery('cards').for(deckId);

    if (cardId) query.findById(cardId);
    return await query;
  }

  async create({
    name,
    userId,
    monkeyId,
  }: Partial<DeckModel>): Promise<DeckModel> {
    return await this.deckModel.query().insert({
      name,
      userId,
      monkeyId,
    });
  }

  async addCard(deckId: number, cardId: number) {
    const card = await this.deckModel
      .relatedQuery('cards')
      .for(deckId)
      .where('cards.id', cardId)
      .first();
    if (card) {
      await this.deckModel
        .relatedQuery('cards')
        .for(deckId)
        .where('cards.id', cardId)
        .patch({
          count: 2,
        });
    } else {
      await this.deckModel.relatedQuery('cards').for(deckId).relate(cardId);
    }
  }

  async removeCard(deckId: number, cardId: number) {
    const card = await this.deckModel
      .relatedQuery('cards')
      .for(deckId)
      .where('cards.id', cardId)
      .first();
    if (!card) return;

    if (card.count == 2) {
      await this.deckModel
        .relatedQuery('cards')
        .for(deckId)
        .where('cards.id', cardId)
        .patch({
          count: 1,
        });
    } else {
      await this.deckModel
        .relatedQuery('cards')
        .for(deckId)
        .unrelate()
        .where('cards.id', cardId);
    }
  }

  async addStarter(addDeck: AddDeck, monkeyId: number, userId: number) {
    // create deck
    const deck = await this.create({
      name: addDeck.name,
      userId,
      monkeyId,
    });

    // get deck cards
    const cardNames = addDeck.cards.map((c) => c.name);
    const dbCards = await this.cardModel.query().where('name', 'in', cardNames);
    // create data to relate to deck
    const addCardData = [] as { id: number; count?: number }[];
    dbCards.forEach((dbCard) => {
      const deckCard = addDeck.cards.find((c) => c.name === dbCard.name);
      if (!deckCard) return;
      addCardData.push({
        id: dbCard.id,
        count: deckCard.count,
      });
    });
    await this.deckModel.relatedQuery('cards').for(deck.id).relate(addCardData);
  }

  async deleteWithMonkeys(monkeyIds: number[], userId: number) {
    return await this.deckModel
      .query()
      .del()
      .where({ userId })
      .andWhere('monkeyId', 'in', monkeyIds);
  }

  async del(deckId: number, userId?: number) {
    const query = this.deckModel.query().del().where({ deckId });
    if (userId) query.where({ userId });
    return await query;
  }
}
