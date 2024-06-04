import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [NftController],
  providers: [NftService, PrismaService],
  exports: [NftService],
})
export class NftModule {}
