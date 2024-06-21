import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.jwt.guard';

import { NftService } from './nft.service';
import { CreateNftDTO } from './dto/createNft.dto';

@ApiTags('nfts')
@Controller('/nfts')
export class NftController {
  constructor(private nftService: NftService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('create-nft')
  @ApiOperation({ summary: 'Create NFT' })
  getMyProfile(@Request() req, @Body() data: CreateNftDTO) {
    return this.nftService.createNft(req.user.id, data);
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('buy-nft/:address/:tokenId')
  @ApiOperation({ summary: 'Create NFT' })
  buyNft(@Param('address') address: string, @Param('tokenId') tokenId: number) {
    return this.nftService.buyNft(address, +tokenId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('resell-nft/:tokenId/:price')
  @ApiOperation({ summary: 'Resell NFT' })
  reSellNft(@Param('tokenId') tokenId: number, @Param('price') price: number) {
    return this.nftService.reSellNFT(+tokenId, +price);
  }


  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('like-nft/:tokenId')
  @ApiOperation({ summary: 'Like NFT' })
  likeNft(@Request() req, @Param('tokenId') tokenId: number) {
    return this.nftService.likeNft(req.user.id, tokenId);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('unlike-nft/:tokenId')
  @ApiOperation({ summary: 'UnLike NFT' })
  unLikeNft(@Request() req, @Param('tokenId') tokenId: number) {
    return this.nftService.unlikeNft(req.user.id, tokenId);
  }

  @ApiBearerAuth()
  @Post('nft-like-count/:userId/:tokenId')
  @ApiOperation({ summary: 'Get likes of Nft' })
  getLikeNft(
    @Param('userId') userId: number,
    @Param('tokenId') tokenId: number,
  ) {
    return this.nftService.getLikeNft(userId, tokenId);
  }

  @ApiBearerAuth()
  @Get('liked-list/:address')
  @ApiOperation({ summary: 'Get Nft liked list' })
  getListNftLiked(@Param('address') address: string) {
    return this.nftService.getListNftLiked(address);
  }

  @ApiBearerAuth()
  @Get('sell-list/:address')
  @ApiOperation({ summary: 'Get Nft sold list' })
  getListSoldNft(@Param('address') address: string) {
    return this.nftService.getListSoldNftByAddress(address);
  }

  @ApiBearerAuth()
  @Get('own-list/:address')
  @ApiOperation({ summary: 'Get Nft owner list' })
  getListOwnerNft(@Param('address') address: string) {
    return this.nftService.getListOwnerNftByAddress(address);
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get All Collections' })
  getAllCollections() {
    return this.nftService.getAllCollections();
  }
  //   @UseGuards(AuthGuard)
  //   @ApiBearerAuth()
  //   @Put('my-profile')
  //   @ApiOperation({ summary: 'Update the profile of current user' })
  //   updateMyInformation(@Request() req, @Body() data: updateUserProfileDTO) {
  //     return this.userService.updateUserProfile(req.user.id, data);
  //   }
}
