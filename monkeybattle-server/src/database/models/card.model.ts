import { BaseModel } from './base.model';
import { Model } from 'objection';
import { GameClassModel } from './gameClass.model';

export class CardModel extends BaseModel {
  static tableName = 'cards';

  bananas!: number;
  description?: string;
  attack?: number;
  health?: number;
  name!: string;
  count!: number;

  gameClassId?: number;
  gameClass!: GameClassModel;

  static modifiers = {
    ...BaseModel.modifiers,
  };

  static relationMappings = () => ({
    class: {
      modelClass: GameClassModel,
      relation: Model.BelongsToOneRelation,
      join: {
        from: 'cards.classId',
        to: 'classes.id',
      },
    },
  });
}
