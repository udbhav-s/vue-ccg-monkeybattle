import { UserModel } from 'src/database/models/user.model';

export interface LeaderboardUser extends UserModel {
  winningXp: number;
}
