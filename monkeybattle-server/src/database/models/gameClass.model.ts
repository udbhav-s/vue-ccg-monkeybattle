import { BaseModel } from './base.model';

export class GameClassModel extends BaseModel {
  static tableName = 'gameClasses';

  name!: string;
}
