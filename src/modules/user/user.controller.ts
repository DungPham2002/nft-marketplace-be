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

import { UserService } from './user.service';
import { updateUserProfileDTO } from './dto/updateUserProfile.dto';

@ApiTags('users')
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile/:address')
  @ApiOperation({ summary: 'Get the profile by address' })
  getProfileByAddress(@Param('address') address: string) {
    return this.userService.getUserByAddress(address);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('my-profile')
  @ApiOperation({ summary: 'Get the profile of current user' })
  getMyProfile(@Request() req) {
    return this.userService.getUserById(req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('my-profile')
  @ApiOperation({ summary: 'Update the profile of current user' })
  updateMyInformation(@Request() req, @Body() data: updateUserProfileDTO) {
    return this.userService.updateUserProfile(req.user.id, data);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('follow-user/:address')
  @ApiOperation({ summary: 'Follow user' })
  followUser(@Request() req, @Param('address') address: string) {
    return this.userService.followUser(req.user.id, address);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Delete('unfollow-user/:address')
  @ApiOperation({ summary: 'Unfollow user' })
  UnfollowUser(@Request() req, @Param('address') address: string) {
    return this.userService.unfollowUser(req.user.id, address);
  }

  @ApiBearerAuth()
  @Post('get-follow-user/:userId/:address')
  @ApiOperation({ summary: 'Get follow user' })
  getFollowUser(
    @Param('userId') userId: number,
    @Param('address') address: string,
  ) {
    return this.userService.getFollowUser(userId, address);
  }

  @ApiBearerAuth()
  @Get('follower-list/:address')
  @ApiOperation({ summary: 'Get Nft liked list' })
  getListFollower(@Param('address') address: string) {
    return this.userService.getFollowerByAddress(address);
  }

  @ApiBearerAuth()
  @Get('following-list/:address')
  @ApiOperation({ summary: 'Get Nft liked list' })
  getListFollowing(@Param('address') address: string) {
    return this.userService.getFollowingByAddress(address);
  }

  @ApiBearerAuth()
  @Get('top-follower')
  @ApiOperation({ summary: 'Get top follower' })
  getTopFollower() {
    return this.userService.getTopFollower();
  }
}
