// createUser.dto.ts
import { CreateUserDto } from './create-user.dto';

export class CreateUserWithListDto {
  userData: CreateUserDto;
  emailList: string[];
}
