import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Country } from './dto/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let userId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user with provided data and email list', async () => {
      const userData: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        country: Country.NIGERIA,
        zipcode: 12345,
        profession: 'Engineer',
        company: 'ABC Inc.',
        links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
      };
      const emailList: string[] = ['user1@example.com', 'user2@example.com']; // Sample email list
      const userDataWithList = { userData, emailList };

      jest.spyOn(service, 'createInitialUser').mockImplementation(async (userData) => {
        userId = 'generatedUserId'; // You can use actual generated ID here
        return;
      });

      await controller.createUser(userDataWithList);

      expect(service.createInitialUser).toHaveBeenCalledWith(userData, emailList);
    });
  });

  describe('enterUserData', () => {
    it('should update user data for the provided user ID', async () => {
      const userData: UpdateUserDto = {
        email: 'updated@example.com',
      };

      jest.spyOn(service, 'enterUserData').mockResolvedValueOnce();

      await controller.enterUserData(userId, userData);

      expect(service.enterUserData).toHaveBeenCalledWith(userId, userData);
    });
  });

  describe('followUser', () => {
    it('should create a follow relationship between two users', async () => {
      jest.spyOn(service, 'followUser').mockResolvedValueOnce();

      await controller.followUser(userId, userId); // Following the same user for simplicity

      expect(service.followUser).toHaveBeenCalledWith(userId, userId);
    });
  });
});
