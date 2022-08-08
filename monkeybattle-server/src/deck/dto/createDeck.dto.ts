import { IsInt, IsString } from 'class-validator';

export class CreateDeckDto {
  @IsString()
  name!: string;

  @IsInt()
  monkeyId!: number;
}
