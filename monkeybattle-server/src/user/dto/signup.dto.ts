import { IsDefined, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
