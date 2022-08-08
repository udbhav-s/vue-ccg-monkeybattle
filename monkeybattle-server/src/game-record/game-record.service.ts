import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';
import { GameRecordModel } from 'src/database/models/gameRecord.model';
import { UserModel } from 'src/database/models/user.model';
import { LeaderboardUser } from './dto/leaderboardUser.dto';

@Injectable()
export class GameRecordService {
  constructor(
    @Inject('UserModel') private userModel: ModelClass<UserModel>,
    @Inject('GameRecordModel')
    private gameRecordModel: ModelClass<GameRecordModel>,
  ) {}

  async getUserRecords(userId: number, limit = 5): Promise<GameRecordModel[]> {
    return await this.gameRecordModel
      .query()
      .where({ winnerId: userId })
      .orWhere({ loserId: userId })
      .orderBy('createdAt', 'desc')
      .withGraphFetched('[winner, loser]')
      .limit(limit);
  }

  async getTopUsersByXp(
    n?: number,
    limit = 10,
    offset = 0,
  ): Promise<LeaderboardUser[]> {
    let afterDate = new Date();
    if (n) afterDate.setDate(afterDate.getDate() - n);
    else afterDate = new Date(0);
    // compare only date without time
    afterDate.setHours(0, 0, 0);

    const result = (await this.gameRecordModel
      .query()
      .alias('totalXpRows')
      .select('totalXpRows.winnerId')
      .sum('totalXpRows.xp as winningXp')
      .joinRelated('winner')
      .select('winner.*')
      .groupBy('totalXpRows.winnerId', 'winner.id')
      .orderBy('winningXp', 'desc')
      .limit(limit)
      .offset(offset)
      .from(function () {
        this.unionAll(function () {
          this.select('winnerId')
            .sum('winningXp as xp')
            .from('gameRecords')
            .groupBy('winnerId')
            .where('createdAt', '>=', afterDate.toISOString());
        });
        this.unionAll(function () {
          // select loserId as winnerId to have homogenous rows for union & sum
          this.select('loserId as winnerId')
            .sum('losingXp as xp')
            .from('gameRecords')
            .groupBy('loserId')
            .where('createdAt', '>=', afterDate.toISOString());
        });
        this.as('totalXpRows');
      })) as unknown as LeaderboardUser[];

    return result;
  }
}
