import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';
import { CardModel } from 'src/database/models/card.model';
import { GameClassModel } from 'src/database/models/gameClass.model';
import { UserModel } from 'src/database/models/user.model';
import sets from 'monkeybattle-shared/lib/data/cards';
import { AddCards } from 'src/game/starter/starterCards';
import { GetCardsDto } from './dto/getCards.dto';

@Injectable()
export class CardService {
  constructor(
    @Inject('CardModel') private cardModel: ModelClass<CardModel>,
    @Inject('UserModel') private userModel: ModelClass<UserModel>,
    @Inject('GameClassModel')
    private gameClassModel: ModelClass<GameClassModel>,
  ) {}

  async addFromSets() {
    const dbCards = await this.cardModel.query();
    const gameClasses = await this.gameClassModel.query();

    // add new cards
    const addCards: Partial<CardModel>[] = [];
    for (const card of sets) {
      if (!dbCards.find((c) => c.name === card.name)) {
        const addCard: Partial<CardModel> = {
          name: card.name,
          bananas: card.bananas,
        };
        if (card.description) addCard.description = card.description;
        if (card.attack) addCard.attack = card.attack;
        if (card.health) addCard.health = card.health;
        if (card.gameClass) {
          addCard.gameClassId = gameClasses.find(
            (cls) => cls.name === card.gameClass,
          )?.id;
        }
        addCards.push(addCard);
      }
    }
    if (addCards.length) await this.cardModel.query().insert(addCards);
  }

  async get(options: GetCardsDto, userId?: number): Promise<CardModel[]> {
    if (userId) {
      if (options.id) {
        // add cards.id for related query
        (options as GetCardsDto & { 'cards.id': number })['cards.id'] =
          options.id;
        delete options.id;
      }
      return await this.userModel
        .relatedQuery('cards')
        .for(userId)
        .where(options);
    } else {
      return await this.cardModel.query().where(options);
    }
  }

  async addCardToUser(id: number, userId: number, addCount: number) {
    const rows = await this.get({ id }, userId);
    if (rows.length === 0) {
      return await this.userModel.relatedQuery('cards').for(userId).relate(id);
    } else {
      return await this.userModel
        .relatedQuery('cards')
        .for(userId)
        .where({ id })
        .patch({
          count: rows[0].count + addCount,
        });
    }
  }

  async removeCardFromUser(id: number, userId: number, removeCount: number) {
    const card = (await this.get({ id }, userId))[0];
    if (card.count === 1 && removeCount >= 1) {
      return await this.userModel
        .relatedQuery('cards')
        .for(userId)
        .unrelate()
        .where({ id });
    } else {
      if (removeCount > card.count) removeCount = card.count;
      return await this.userModel
        .relatedQuery('cards')
        .for(userId)
        .patch({
          count: card.count - removeCount,
        })
        .where({ id });
    }
  }

  async addInitialCardsToUser(cards: AddCards, userId: number) {
    const dbCards = await this.cardModel.query().where(
      'name',
      'in',
      cards.map((c) => c.name),
    );
    const addCardData = [];
    for (const dbCard of dbCards) {
      const card = cards.find((c) => c.name === dbCard.name);
      if (!card) return;
      addCardData.push({
        id: dbCard.id,
        count: card.count,
      });
    }
    return await this.userModel
      .relatedQuery('cards')
      .for(userId)
      .relate(addCardData);
  }
}
