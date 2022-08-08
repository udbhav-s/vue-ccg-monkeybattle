import { forwardRef, Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { DeckModule } from 'src/deck/deck.module';

@Module({
  imports: [forwardRef(() => DeckModule)],
  providers: [CardService],
  exports: [CardService],
  controllers: [CardController],
})
export class CardModule {}
