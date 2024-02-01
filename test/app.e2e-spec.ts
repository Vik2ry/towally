import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateUserWithListDto } from '../src/user/dto/create-user-with-list.dto';
import { Country, RoleType } from '../src/user/dto/enums';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { UserService } from '../src/user/user.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
        providers: [UserService],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
    userService = app.get<UserService>(UserService);

  });

  afterAll(() => {
    app.close();
  });

  describe('Create user', () => {
    it('should create a user', () => {
      const dto: CreateUserWithListDto = {
        userData: {
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
        },
        emailList: ['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example@example.com', 'user5@example.com'],	
      };
      return pactum
        .spec()
        .post('/users/create')
        .withBody(dto)
        .expectStatus(201)
    });
  });

  describe('getUserID', () => {
    it('should return the user ID for a valid email', async () => {
      return pactum
          .spec()
          .get('/users/{email}')
          .withPathParams('email', 'test@example.com')
          .expectStatus(200)
          .expectBodyContains('$S{userId}')
          .stores('userId', 'userId');
      });
    });

    describe('getUserID', () => {
      it('should return the user ID for a valid email', async () => {
        return pactum
            .spec()
            .get('/users/{email}')
            .withPathParams('email', 'user1@example.com')
            .expectStatus(200)
            .stores('ided', 'userId');
        });
      });
  
  describe('Edit user', () => {
    it('should edit user', () => {
      const dto: UpdateUserDto = {
        email: 'test@example.com',
        firstName: 'Johannu',
        lastName: 'Doe',
        dob: new Date('1990-01-01'),
        country: Country.NIGER,
        zipcode: 12345,
        profession: 'Doctor',
        company: 'ABC Inc.',
        links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
        tagline: 'Hello World',
        }
      return pactum
        .spec()
        .patch('/users/{UserBeenFollowed}/enter-data')
        .withPathParams('UserBeenFollowed', '$S{userId}')
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.profession)
        .inspect()
    });
  });

  describe('UserId should follow UserBeenfollowed', () => {
    it('should post UserId followed UserBeenFollowed', () => {
      return pactum
        .spec()
        .post('/users/{UserBeenFollowed}/{UserId}')
        .withPathParams('UserBeenFollowed', '$S{userId}')
        .withPathParams('UserId', '$S{ided}')
        .expectStatus(201)
        .inspect()
      });
  });

});
