import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
  ){}
  async create(createNotificationDto: CreateNotificationDto) {
    console.log(createNotificationDto, "adding")
   try {
    const data =await this.notificationRepository.create({
      message: createNotificationDto.message,
      N_sender: createNotificationDto.sender,
      N_receiver: createNotificationDto.receiver
    })
    const savedMessage = await this.notificationRepository.save(data)
    console.log(savedMessage,"finaly")
    return savedMessage
   } catch (error) {
    console.log(error)
   }
  }

  async findAll(createNotificationDto: CreateNotificationDto) {
    try {
      const data = await this.notificationRepository
        .createQueryBuilder('notification')
        .addSelect([
          'notification.id',
          'notification.message',
          'notification.isRead',
          'notification.nSenderId',
          'notification.nReceiverId'
        ])
        .where("notification.N_receiver = :N_receiver", {
          N_receiver: createNotificationDto.id
        })
        .getRawMany();
  
      // Map each item in the data array to select only specific fields
      const formattedData = data.map(item => ({
        id: item.notification_id,
        message: item.notification_message,
        isRead: item.notification_isRead,
        N_sender: item.notification_nSenderId,
        N_receiver: item.notification_nReceiverId
      }));
  
      console.log(formattedData, "get");
  
      return formattedData;
    } catch (error) {
      console.error("Error retrieving notifications:", error);
      throw error;
    }
  }
  
  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
