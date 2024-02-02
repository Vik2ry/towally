import { IsNotEmpty, IsString } from 'class-validator';

export class FreezeUserAccountDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}