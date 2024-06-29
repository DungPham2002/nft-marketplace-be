import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';



@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    JwtService,
    PrismaService,
  ],
  exports: [NotificationService]
})
export class NotificationModule {}
