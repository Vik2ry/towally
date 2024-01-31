import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Country, RoleType } from './dto/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Share } from '@prisma/client'; // Import the correct type declaration
import { DefaultArgs } from '@prisma/client/runtime/library';
import { User } from '@prisma/client'; // Import the correct type declaration
import { Follow } from '@prisma/client'; // Import the correct type declaration

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, ConfigService],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInitialUser', () => {
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
      const emailList: string[] = ['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com', 'user5@example.com'];

      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce({ 
        id: 'generatedUserId',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'john@example.com',
        dob: new Date('1990-01-01'),
        country: Country.NIGERIA,
        zipcode: 12345,
        profession: 'Engineer',
        company: 'ABC Inc.',
        links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
        tagline: 'Hello World',
        roleType: 'admin',
      });
      jest.spyOn(prismaService.share, 'create').mockResolvedValueOnce({} as Share);

      await service.createInitialUser(userData, emailList);

      expect(prismaService.user.create).toHaveBeenCalledWith({ data: userData });
      expect(prismaService.share.create).toHaveBeenCalledWith({ data: { owner: { connect: { id: 'generatedUserId' } }, price: 100.0 } });
    });
  });

  describe('enterUserData', () => {
    it('should update user data for the provided user ID', async () => {
      const userId = 'sampleUserId';
      const userData: UpdateUserDto = {
        email: 'updated@example.com',
      };

      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce({} as User);

      await service.enterUserData(userId, userData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: userData,
      });
    });
  });

  describe('followUser', () => {
    it('should create a follow relationship between two users', async () => {
      const userId = 'sampleUserId';

      jest.spyOn(prismaService.follow, 'findFirst').mockResolvedValueOnce(null);
      jest.spyOn(prismaService.follow, 'create').mockResolvedValueOnce({} as Follow);

      await service.followUser(userId, userId);

      expect(prismaService.follow.findFirst).toHaveBeenCalledWith({
        where: {
          followerId: userId,
          followingId: userId,
        },
      });
      expect(prismaService.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: userId,
          followingId: userId,
        },
      });
    });
  });
});
