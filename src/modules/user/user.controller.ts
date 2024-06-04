import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
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


}
