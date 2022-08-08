import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { GameRecordService } from '../game-record/game-record.service';
import { FormatResponseInterceptor } from 'src/common/interceptors/formatResponse.interceptor';
import { SessionRequest } from 'src/common/types/sessionRequest';
import { GameRecordModel } from 'src/database/models/gameRecord.model';
import { UserService } from 'src/user/user.service';
import { LeaderboardUser } from './dto/leaderboardUser.dto';

@UseInterceptors(FormatResponseInterceptor)
@Controller('api/game-record')
export class GameRecordController {
  constructor(
    private readonly gameRecordService: GameRecordService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getUserPastGames(
    @Req() req: SessionRequest,
    @Query('n', ParseIntPipe) n?: number,
  ): Promise<GameRecordModel[]> {
    const user = await this.userService.getById(req.user.id);
    if (!user) throw new NotFoundException();

    return await this.gameRecordService.getUserRecords(req.user.id, n || 5);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('offset', ParseIntPipe) offset = 0,
    // from last n days
    @Query('n', ParseIntPipe) n = 7,
  ): Promise<LeaderboardUser[]> {
    if (![7, 31, 365].includes(n)) throw new BadRequestException();
    return await this.gameRecordService.getTopUsersByXp(n, limit, offset);
  }
}
