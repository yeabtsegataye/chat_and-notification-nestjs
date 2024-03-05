import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Chat } from 'src/chat/entities/chat.entity';
import { NotificationGateway } from 'src/socket/socket.getway';
// import { NotificationModule } from 'src/socket/socket.module';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    private readonly MGateway: NotificationGateway
  ){
  }
 async create(createMessageDto: CreateMessageDto) {
   const data = await this.messageRepository.create({
     message: createMessageDto.message,
     sender: createMessageDto.sender,
     receiver: createMessageDto.receiver,
   })
   const savedMessage = await this.messageRepository.save(data)
  //  console.log(savedMessage , "chat mwssa ");
   const existingChat = await this.chatRepository.createQueryBuilder("chat")
        .where("(chat.sender = :sender AND chat.receiver = :receiver)", { sender: savedMessage.sender, receiver: savedMessage.receiver })
        .orWhere("(chat.sender = :receiver AND chat.receiver = :sender)", { sender: savedMessage.receiver, receiver: savedMessage.sender })
        .getOne();
  //  return savedMessage
  if(!existingChat) return;
  console.log(savedMessage.message, "mmmmm");
  
 this.MGateway.handleSendMessage({roomId: existingChat.id, message: savedMessage});

  }
  async Get_message(createMessageDto: CreateMessageDto){
   try {
    const data = await this.messageRepository
    .createQueryBuilder('message')
    .select([
      'message.id',
      'message.message',
      'message.senderId',
      'message.receiverId',
    ])
    .where("(message.sender = :sender AND message.receiver = :receiver)", { sender: createMessageDto.sender, receiver: createMessageDto.receiver })
    .orWhere("(message.sender = :receiver AND message.receiver = :sender)", { sender: createMessageDto.receiver, receiver: createMessageDto.sender })
    .getRawMany();
    const messages = data.map(message => ({
      message: message.message_message,
      sender: message.senderId,
      receiver: message.receiverId,
      id: message.message_id,
    }));
   
    if(!data) return []
    return messages;
   } catch (error) {
    console.log(error)
    return
   }
  }
  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
