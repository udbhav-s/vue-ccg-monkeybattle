import { IsOptional, IsEnum } from 'class-validator';
import { GetOptionsDto } from 'src/common/dto/getOptions.dto';

export class UserGetOptionsDto extends GetOptionsDto {
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'xp'])
  orderBy?: string;
}
