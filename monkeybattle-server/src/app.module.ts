import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { CardModule } from './card/card.module';
import { MonkeyModule } from './monkey/monkey.module';
import { DeckModule } from './deck/deck.module';
import { GameGateway } from './game/game.gateway';
import { GameRecordModule } from './game-record/game-record.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
    CardModule,
    MonkeyModule,
    DeckModule,
    GameRecordModule,
  ],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})
export class AppModule {}
