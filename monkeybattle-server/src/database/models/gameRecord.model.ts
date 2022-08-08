import { BaseModel } from './base.model';
import { Model } from 'objection';
import { UserModel } from './user.model';

export class GameRecordModel extends BaseModel {
  static tableName = 'gameRecords';

  winnerId!: number;
  loserId!: number;
  winningXp!: number;
  losingXp!: number;
  createdAt!: string;

  winner!: UserModel;
  loser!: UserModel;

  static relationMappings = () => ({
    winner: {
      modelClass: UserModel,
      relation: Model.HasOneRelation,
      join: {
        from: 'gameRecords.winnerId',
        to: 'users.id',
      },
    },
    loser: {
      modelClass: UserModel,
      relation: Model.HasOneRelation,
      join: {
        from: 'gameRecords.loserId',
        to: 'users.id',
      },
    },
  });
}
