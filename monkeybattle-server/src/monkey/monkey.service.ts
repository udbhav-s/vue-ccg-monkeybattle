import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModelClass } from 'objection';
import { MonkeyModel } from 'src/database/models/monkey.model';
import { GameClassModel } from 'src/database/models/gameClass.model';
import { gameClasses } from 'monkeybattle-shared';
import { monkeys } from 'monkeybattle-shared/lib/data/monkeys';
import { UserModel } from 'src/database/models/user.model';

@Injectable()
export class MonkeyService {
  private readonly logger = new Logger(MonkeyService.name);

  constructor(
    @Inject('MonkeyModel') private monkeyModel: ModelClass<MonkeyModel>,
    @Inject('UserModel') private userModel: ModelClass<UserModel>,
    @Inject('GameClassModel')
    private gameClassModel: ModelClass<GameClassModel>,
  ) {}

  async getById(id: number) {
    return await this.monkeyModel
      .query()
      .findById(id)
      .withGraphFetched('[gameClass]');
  }

  async getAllMonkeys() {
    return await this.monkeyModel.query().withGraphFetched('[gameClass]');
  }

  async getMonkeysByUser(userId: number): Promise<MonkeyModel[]> {
    return await this.userModel
      .relatedQuery('monkeys')
      .for(userId)
      .withGraphFetched('[gameClass]');
  }

  async addMonkeysToUser(monkeyIds: number[], userId: number) {
    return await this.userModel
      .relatedQuery('monkeys')
      .for(userId)
      .relate(monkeyIds);
  }

  async syncMonkeysAndClasses() {
    // update classes

    const addClasses = [];
    let dbGameClasses = await this.gameClassModel.query();
    for (const gameClass of gameClasses) {
      if (!dbGameClasses.find((dgc) => dgc.name === gameClass))
        addClasses.push({ name: gameClass });
    }

    if (addClasses.length) await this.gameClassModel.query().insert(addClasses);
    dbGameClasses = await this.gameClassModel.query();

    // update monkeys

    const addMonkeys = [];

    const dbMonkeys = await this.getAllMonkeys();
    for (const monkey of monkeys) {
      if (!dbMonkeys.find((dbm) => dbm.name === monkey.name))
        addMonkeys.push({
          name: monkey.name,
          description: monkey.description,
          gameClassId: dbGameClasses.find(
            (dgc) => dgc.name === monkey.monkeyClass,
          )?.id,
        });
    }

    if (addMonkeys.length) await this.monkeyModel.query().insert(addMonkeys);
  }
}
