import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetOptionsDto {
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt'])
  orderBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  offset?: number;
}
