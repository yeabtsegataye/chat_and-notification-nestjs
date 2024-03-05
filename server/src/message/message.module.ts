import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { NotificationGateway } from 'src/socket/socket.getway';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat]), NotificationModule],
  controllers: [MessageController],
  providers: [MessageService, NotificationGateway],
})
export class MessageModule {}
