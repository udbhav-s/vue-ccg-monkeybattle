import { BaseModel } from './base.model';
import { Model } from 'objection';
import { GameClassModel } from './gameClass.model';

export class MonkeyModel extends BaseModel {
  static tableName = 'monkeys';

  id!: number;
  name!: string;
  description?: string;
  monkeyClass?: string;

  gameClassId!: number;

  gameClass!: GameClassModel;

  static modifiers = {
    ...BaseModel.modifiers,
  };

  static relationMappings = () => ({
    gameClass: {
      modelClass: GameClassModel,
      relation: Model.BelongsToOneRelation,
      join: {
        from: 'monkeys.gameClassId',
        to: 'gameClasses.id',
      },
    },
  });
}
