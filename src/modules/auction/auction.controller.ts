import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.jwt.guard';

import { CreateAuctionDTO } from './dto/createAuction.dto';
import { AuctionService } from './auction.service';

@ApiTags('auction')
@Controller('/auction')
export class AuctionController {
  constructor(private auctionService: AuctionService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('create-auction/:nftId')
  @ApiOperation({ summary: 'Create Auction' })
  createAuction(
    @Request() req,
    @Param('nftId') nftId: number,
    @Body() data: CreateAuctionDTO,
  ) {
    return this.auctionService.createAuction(req.user.id, nftId, data);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('bid-auction/:tokenId')
  @ApiOperation({ summary: 'Make an offer' })
  bidAuction(
    @Request() req,
    @Param('tokenId') tokenId: number,
    @Body() dto: any,
  ) {
    return this.auctionService.bidAuction(req.user.id, tokenId, dto.price);
  }

  @ApiBearerAuth()
  @Post('end-auction/:tokenId')
  @ApiOperation({ summary: 'End auction' })
  endAuction(@Param('tokenId') tokenId: number) {
    return this.auctionService.endAuction(tokenId);
  }

  @ApiBearerAuth()
  @Get('top-auction')
  @ApiOperation({ summary: 'Get top auction' })
  getTopAuction() {
    return this.auctionService.getTopAuction();
  }

}
