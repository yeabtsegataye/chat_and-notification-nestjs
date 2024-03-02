import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { NotificationGateway } from './socket/socket.getway';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/entities/notification.entity';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './message/entities/message.entity';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',//'mysql-159caac8-tatitaye0-03ac.a.aivencloud.com',
    port: 3306,//26637,
    username:'tati',//'avnadmin',  
    password: '123',//'AVNS_luoZzR5b1SjmKg9dNor',  
    database: 'chat',//'defaultdb',
    entities: [User,Notification,Chat,Message],
    synchronize: true,
  }),UserModule, NotificationModule,ChatModule,MessageModule,],
  controllers: [],
  providers: [ NotificationGateway],
})
export class AppModule {}
