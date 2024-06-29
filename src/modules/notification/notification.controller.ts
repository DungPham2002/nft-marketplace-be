import {
  Controller,
  Param,
  Put,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.jwt.guard';
import { NotificationGateway } from './notification.gateway';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('notification')
@Controller('/notification')
export class NotificationController {
  constructor(private notificationGateway: NotificationGateway) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('update-notify/:id')
  @ApiOperation({ summary: 'Update Notification' })
  updateNotify(@Request() req, @Param('id') id: number) {
    return this.notificationGateway.updateNotification(req.user.id, id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/')
  @ApiOperation({ summary: 'Update Notification' })
  getNotify(@Request() req) {
    return this.notificationGateway.getAllNotification(req.user.id);
  }
}
