import { IsInt } from 'class-validator';

export class AddCardDto {
  @IsInt()
  cardId!: number;

  @IsInt()
  deckId!: number;
}
