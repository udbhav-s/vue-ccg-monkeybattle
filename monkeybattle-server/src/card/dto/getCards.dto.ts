import { IsInt, IsOptional } from 'class-validator';

export class GetCardsDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsInt()
  bananas?: number;
}
