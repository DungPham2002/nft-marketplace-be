import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: any) {
    console.log(`WebSocket Init`);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.Authorization?.split(' ')[1];

      if (!token) {
        console.log('No token provided');
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      client.data.user = payload;
      client.join(client.data.user.address);
      console.log(`Client connected: ${client.id}`);
    } catch (err) {
      console.log('JWT validation failed:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subcribe')
  handleSubscribe(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.userId);
  }

  @SubscribeMessage('notification')
  async notifyUser(address: string, notification: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        address: address,
      },
    });

    if (!user) {
      throw new Error(`User with address ${address} not found.`);
    }
    const existingNotification = await this.prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: notification.type,
        avatar: notification.avatar,
        userAddress: notification.address,
        image: notification.image,
        message: notification.message,
      },
    });

    if (existingNotification) {
      await this.prisma.notification.update({
        where: {
          id: existingNotification.id,
        },
        data: {
          isRead: false,
        },
      });
    } else {
      const newNotification = await this.prisma.notification.create({
        data: {
          userId: user.id,
          type: notification.type,
          avatar: notification.avatar,
          userAddress: notification.address,
          image: notification.image,
          message: notification.message,
          isRead: false,
        },
      });
      const newNotificationFormatted = {
        id: newNotification.id,
        type: newNotification.type,
        avatar: newNotification.avatar,
        address: newNotification.userAddress,
        image: newNotification.image,
        message: newNotification.message,
        isRead: newNotification.isRead,
      }
      this.server.to(address).emit('notification', newNotificationFormatted);
    }
  }

  async updateNotification(userId: number, id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return 'User not found';
    }
    await this.prisma.notification.update({
      where: {
        id: +id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getAllNotification(userId: number) {
    const notification = await this.prisma.notification.findMany({
      where: {
        userId: userId,
      },
    });
    return notification.map((notify) => ({
      id: notify.id,
      type: notify.type,
      avatar: notify.avatar,
      address: notify.userAddress,
      image: notify.image,
      message: notify.message,
      isRead: notify.isRead,
    }))
  }
}
