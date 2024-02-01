import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            },
        });
    }

    cleanDb() {
        return this.$transaction([
          this.share.deleteMany(),
          this.transaction.deleteMany(),
          this.follow.deleteMany(),
          this.user.deleteMany(),
        ]);
      }
}
