import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
// import { NotificationGateway } from '../socket/socket.getway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat]),NotificationModule],
  controllers: [ChatController],
  providers: [ChatService,],
})
export class ChatModule {}
