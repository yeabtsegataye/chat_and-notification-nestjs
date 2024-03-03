import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,

  ){}
 async create(createMessageDto: CreateMessageDto) {
   const data = await this.messageRepository.create({
     message: createMessageDto.message,
     sender: createMessageDto.sender,
     receiver: createMessageDto.receiver,
   })
   const savedMessage = await this.messageRepository.save(data)
   return savedMessage
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
