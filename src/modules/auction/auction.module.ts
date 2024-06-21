import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [AuctionController],
  providers: [AuctionService, PrismaService],
  exports: [AuctionService],
})
export class AuctionModule {}
