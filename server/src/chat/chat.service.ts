import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
// import { NotificationGateway } from '../socket/socket.getway'; // Assuming NotificationGateway is defined here

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chat: Repository<Chat>,
    // private readonly notificationGateway: NotificationGateway // Inject NotificationGateway
  ) {}

  async create(createChatDto: CreateChatDto) {
    console.log(createChatDto,"serer")
    try {
      // Check if a chat record exists with the same sender or receiver
      const existingChat = await this.chat.createQueryBuilder("chat")
        .where("(chat.sender = :sender AND chat.receiver = :receiver)", { sender: createChatDto.sender, receiver: createChatDto.receiver })
        .orWhere("(chat.sender = :receiver AND chat.receiver = :sender)", { sender: createChatDto.receiver, receiver: createChatDto.sender })
        .getOne();

      if (existingChat) {
        // If a chat record already exists, send that record
        console.log('Existing chat:', existingChat);

        // this.notificationGateway.handleJoinRoom(createChatDto.sender, existingChat.id); // Pass the socket and room ID to the method
        return existingChat;
      } else {
        // If no chat record exists, create a new one
        const newChat = await this.chat.create({
          sender: createChatDto.sender,
          receiver: createChatDto.receiver,
        });
        // Save the newly created chat record
        const savedChat = await this.chat.save(newChat);
        console.log('Newly created chat:', savedChat);
        // this.notificationGateway.handleJoinRoom(createChatDto.sender, savedChat.id); // Pass the socket and room ID to the method
        return savedChat;
      }
    } catch (error) {
      console.error('Error creating or fetching chat:', error);
      throw new Error('Error creating or fetching chat');
    }
  }

  async findAll() {
    try {
      const allChats = await this.chat.find();
      console.log(allChats);
      return allChats;
    } catch (error) {
      console.error('Error fetching all chats:', error);
      throw new Error('Error fetching all chats');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}

