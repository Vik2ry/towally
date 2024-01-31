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
import { BadRequestException } from '@nestjs/common';

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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: PrismaService,
            useValue: {
              user: {
                create: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
              },
              share: {
                create: jest.fn(),
              },
              follow: {
                findFirst: jest.fn(),
                create: jest.fn(),
              },
            },
          },
        ],
      }).compile();

      service = module.get<UserService>(UserService);
      prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create initial user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        country: Country.NIGER,
        zipcode: 12345,
        profession: 'Engineer',
        company: 'ABC Inc.',
        links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
        tagline: 'Hello World',
        roleType: RoleType.USER,
      };
      const emailList = ['user1@example.com', 'user2@example.com'];

      jest.spyOn(prismaService.user, 'create').mockResolvedValueOnce({} as User);
      jest.spyOn(prismaService.share, 'create').mockResolvedValueOnce({} as Share);

      await expect(service.createInitialUser(userData, emailList)).resolves.toBeUndefined();
    });

    it('should throw error if user creation fails', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        country: Country.NIGER,
        zipcode: 12345,
        profession: 'Engineer',
        company: 'ABC Inc.',
        links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
        tagline: 'Hello World',
        roleType: RoleType.USER,
      };
      const emailList = ['user1@example.com', 'user2@example.com'];

      jest.spyOn(prismaService.user, 'create').mockRejectedValueOnce(new Error('Failed to create user'));

      await expect(service.createInitialUser(userData, emailList)).rejects.toThrow(BadRequestException);
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
