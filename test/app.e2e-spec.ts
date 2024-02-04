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
import { TradeSharesDTO } from '../src/investor/dto/trade-shares.dto';
import { TradeCurrencyDTO } from '../src/investor/dto/trade-currency.dto';
import { AdminTradeCurrencyDTO } from '../src/admin/dto/admin-trade-currency.dto';
import { AdminService } from '../src/admin/admin.service';
import { UserService } from '../src/user/user.service';
import { InvestorService } from '../src/investor/investor.service';
import { FreezeUserAccountDto } from 'src/admin/dto/freeze-user-account.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminService: AdminService;
  let userService: UserService;
  let investorService: InvestorService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
        providers: [PrismaService, AdminService, UserService, InvestorService],
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
    adminService = moduleRef.get<AdminService>(AdminService);
    userService = moduleRef.get<UserService>(UserService);
    investorService = moduleRef.get<InvestorService>(InvestorService);

  });

  afterAll(() => {
    app.close();
  });

  describe('User', () => {
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

    describe('Create user', () => {
      it('should create a user', () => {
        const dto: CreateUserWithListDto = {
          userData: {
            email: "test1010@example.com",
            firstName: "John",
            lastName: "Doe",
            dob: new Date('1990-01-01'),
            country: Country.NIGER,
            zipcode: 12345,
            profession: "Engineer",
            company: "ABC Inc.",
            links: ["http://facebook.com/johndoe", "http://twitter.com/johndoe"],
            tagline: "Hello World",
            roleType: RoleType.INVESTOR,
          },
          emailList: ["user001@example.com", "user002@example.com", "user003@example.com", "user004@example.com", "user005@example.com"],
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

    describe('getUserID', () => {
      it('should return the user ID for a valid email', async () => {
        return pactum
          .spec()
          .get('/users/{email}')
          .withPathParams('email', 'test1010@example.com')
          .expectStatus(200)
          .stores('userI', 'userId');
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: UpdateUserDto = {
          email: 'test9@example.com',
          firstName: 'Johannu',
          lastName: 'Doe',
          dob: new Date('1990-01-01'),
          country: Country.NIGER,
          zipcode: 12345,
          profession: 'Doctor',
          company: 'ABC Inc.',
          links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
          tagline: 'Hello World',
          roleType: RoleType.INVESTOR,
        }
        return pactum
          .spec()
          .patch('/users/{UserBeenFollowed}/enter-data')
          .withBody(dto)
          .withPathParams('UserBeenFollowed', '$S{userId}')
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.profession)
          .inspect()
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: UpdateUserDto = {
          email: 'test9090@example.com',
          firstName: 'Johannu',
          lastName: 'Doe',
          dob: new Date('1990-01-01'),
          country: Country.NIGER,
          zipcode: 12345,
          profession: 'Doctor',
          company: 'ABC Inc.',
          links: ['http://facebook.com/johndoe', 'http://twitter.com/johndoe'],
          tagline: 'Hello World',
          roleType: RoleType.INVESTOR,
        }
        return pactum
          .spec()
          .patch('/users/{UserBeenFollowed}/enter-data')
          .withBody(dto)
          .withPathParams('UserBeenFollowed', '$S{userI}')
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
          .post('/users/{UserId}/{UserBeenFollowed}')
          .withPathParams('UserBeenFollowed', '$S{userId}')
          .withPathParams('UserId', '$S{ided}')
          .expectStatus(201)
          .inspect()
      });
    });

    describe('Upgrade account', () => {
      it('should upgrade account', () => {
        return pactum
          .spec()
          .patch('/users/{userI}/upgrade-account')
          .withPathParams('userI', '$S{userI}')
          .expectStatus(200)
          .inspect()
      });
    });
  });

  describe('Investor', () => {

    describe('Get share id for user', () => {
      it('should get share id for user', () => {
        return pactum
          .spec()
          .get('/investor/share-id/{ided}')
          .withPathParams('ided', '$S{ided}')
          .expectStatus(200)
          .expectBodyContains("shareId")
          .stores('shareIds', 'shareId')
          .inspect()
      });
    });

    describe('Trade shares', () => {
      it('should trade shares', () => {
        const tradeData: TradeSharesDTO = {
          action: 'BUY',
          shareId: '$S{shareIds}',
          price: 1,
        }
        return pactum
          .spec()
          .post('/investor/trade-shares/{userI}')
          .withPathParams('userI', '$S{userI}')
          .withBody(tradeData)
          .expectStatus(201)
          .inspect()
      });
    });

    describe('Trade currency', () => {
      it('should trade currency', () => {
        const tradeData: TradeCurrencyDTO = {
          action: 'BUY',
          amount: 100,
        }
        return pactum
          .spec()
          .post('/investor/trade-currency/{userId}')
          .withPathParams('userId', '$S{userId}')
          .withBody(tradeData)
          .expectStatus(201)
          .inspect()
      });
    });
  });

  describe('Admin', () => {

    describe('Set minimum follow cost', () => {
      it('should set minimum follow cost', () => {
        const setMinimumFollowCostDTO = {
          minimumCost: 100,
        }
        return pactum
          .spec()
          .post('/admin/set-minimum-follow-cost')
          .withBody(setMinimumFollowCostDTO)
          .expectStatus(201)
          .inspect()
      });
    });

    describe('Admin trade currency', () => {
      it('should admin trade currency', () => {
        const tradeData: AdminTradeCurrencyDTO = {
          action: 'BUY',
          wallys: 100,
        }
        return pactum
          .spec()
          .post('/admin/admin-trade-currency')
          .withBody(tradeData)
          .expectStatus(201)
          .inspect()
      });
    });

    describe('Freeze user account', () => {
      it('should freeze user account', () => {
        const dto: FreezeUserAccountDto = {
          userId: ('$S{userId}'),
        }
        return pactum
          .spec()
          .post('/admin/freeze-user-account')
          .withBody(dto)
          .expectStatus(201)
          .inspect()
      });
    });

    describe('Issue data income', () => {
      it('should issue data income', () => {
        return pactum
          .spec()
          .post('/admin/issue-data-income')
          .expectStatus(201)
          .inspect()
      });
    });
  });
});
