import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, UserService],
})
export class AdminModule {}
