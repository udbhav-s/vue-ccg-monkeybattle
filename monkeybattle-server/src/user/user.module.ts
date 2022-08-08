import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CardModule } from 'src/card/card.module';
import { DeckModule } from 'src/deck/deck.module';
import { CardService } from 'src/card/card.service';
import { DeckService } from 'src/deck/deck.service';
import { MonkeyModule } from 'src/monkey/monkey.module';
import { MonkeyService } from 'src/monkey/monkey.service';

@Module({
  imports: [MonkeyModule, CardModule, DeckModule],
  providers: [UserService, MonkeyService, CardService, DeckService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
