// user.controller.ts
import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserWithListDto } from './dto/create-user-with-list.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create')
  async createUser(@Body() createUserWithListDto: CreateUserWithListDto): Promise<void> {
    console.log('createUserWithListDto:', createUserWithListDto);
    const { userData, emailList } = createUserWithListDto;
    await this.userService.createInitialUser(userData, emailList);
  }

  @Patch(':userId/enter-data')
  async enterUserData(@Param('userId') userId: string, @Body() userDataDto: UpdateUserDto) {
    return this.userService.enterUserData(userId, userDataDto);
  }

  @Post(':userId/:userToFollowId')
  async followUser(
    @Param('userId') userId: string,
    @Param('userToFollowId') userToFollowId: string
  ) {
    return this.userService.followUser(userId, userToFollowId);
  }

}
