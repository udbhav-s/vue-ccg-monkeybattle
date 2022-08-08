import { forwardRef, Module } from '@nestjs/common';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { CardModule } from 'src/card/card.module';
import { CardService } from 'src/card/card.service';
import { MonkeyModule } from 'src/monkey/monkey.module';
import { MonkeyService } from 'src/monkey/monkey.service';

@Module({
  imports: [forwardRef(() => CardModule), MonkeyModule],
  providers: [DeckService, CardService, MonkeyService],
  controllers: [DeckController],
  exports: [DeckService],
})
export class DeckModule {}
