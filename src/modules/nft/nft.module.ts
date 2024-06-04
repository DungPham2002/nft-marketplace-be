import { Module } from "@nestjs/common";
import { NftController } from "./nft.controller";
import { NftService } from "./nft.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [JwtModule, PrismaModule],
    controllers: [NftController],
    providers: [NftService, PrismaService],
    exports: [NftService],
 })
export class NftModule {}
  