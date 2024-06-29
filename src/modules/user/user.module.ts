import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { NotificationGateway } from '../notification/notification.gateway';

// import { UserListener } from './user.listener';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, NotificationGateway],
  exports: [UserService],
})
export class UserModule {}
