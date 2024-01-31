// createUser.dto.ts
import { ValidateNested, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

export class CreateUserWithListDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  userData: CreateUserDto = new CreateUserDto();

  @IsArray()
  @ArrayNotEmpty()
  emailList: string[];
}
