// user.controller.ts
import { Body, Controller, Param, Patch, Post, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserWithListDto } from './dto/create-user-with-list.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('create')
  async createUser(@Body() createUserWithListDto: CreateUserWithListDto): Promise<void> {
    const { userData, emailList } = createUserWithListDto;
    await this.userService.createInitialUser(userData, emailList);
  }

  @Patch(':userId/enter-data')
  async enterUserData(@Param('userId') userId: string, @Body() userDataDto: UpdateUserDto) {
    userDataDto.dob = new Date(userDataDto.dob); // Convert dob to a Date object
    return this.userService.enterUserData(userId, userDataDto);
  }

  @Get(':email')
  async getUserId(@Param('email') email: string) {
    try {
      const userId = await this.userService.getUserId(email);
      if (!userId) {
        throw new NotFoundException('User not found');
      }
      return { userId };
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving user ID');
    }
  }

  @Post(':userId/:userBeenFollowed')
  async followUser(
    @Param('userId') userId: string,
    @Param('userBeenFollowed') userBeenFollowed: string
  ) {
    return this.userService.followUser(userId, userBeenFollowed);
  }

  @Patch(':userId/upgrade-account')
  async upgradeAccount(@Param('userId') userId: string) {
    console.log("userId: ", userId, 'upgradeAccount');
    return this.userService.upgradeAccount(userId);
  }

}
