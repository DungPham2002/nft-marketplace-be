import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
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