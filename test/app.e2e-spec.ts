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
import { TradeSharesDTO } from 'src/investor/dto/trade-shares.dto';
import { TradeCurrencyDTO } from 'src/investor/dto/trade-currency.dto';
import { AdminTradeCurrencyDTO } from 'src/admin/dto/admin-trade-currency.dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
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
          email: 'test99@example.com',
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
          .withBody(dto)
          .withPathParams('UserBeenFollowed', '$S{userId}')
          .expectStatus(200)
          .expectBodyContains("updatedUser")
          .expectBodyContains(100)
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
          .patch('/users/{userId}/upgrade-account')
          .withPathParams('userId', '$S{userId}')
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
          .stores('shareId', 'shareId')
          .inspect()
      });
    });

    describe('Trade shares', () => {
      it('should trade shares', () => {
        const tradeData: TradeSharesDTO = {
          shareId: "100",
          action: 'BUY',
          price: 100,
        }
        return pactum
          .spec()
          .post('/investor/trade-shares/{userId}')
          .withPathParams('userId', '$S{userId}')
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
        return pactum
          .spec()
          .post('/admin/freeze-user-account')
          .withBody('userId')
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
