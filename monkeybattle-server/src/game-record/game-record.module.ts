import { Module } from '@nestjs/common';
import { GameRecordService } from './game-record.service';
import { GameRecordController } from './game-record.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [UserModule],
  providers: [GameRecordService, UserService],
  controllers: [GameRecordController],
})
export class GameRecordModule {}
