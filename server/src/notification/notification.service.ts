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

  async remove(id: number) {
    try {
      // Execute the deletion query, handling potential errors
      const deleteResult = await this.notificationRepository
        .createQueryBuilder('notification')
        .where('id = :id', { id })
        .delete()
        .execute();
  
      // Check if any notifications were actually deleted
      if (deleteResult.affected === 0) {
        console.log(`Notification with ID ${id} not found. No deletions performed.`);
        return `No notification with ID ${id} found.`; // Inform the caller
      } else {
        console.log(`${deleteResult.affected} notification(s) deleted successfully.`);
        return `Removed notification(s) with ID(s): ${id}`; // Inform the caller
      }
    } catch (error) {
      console.error(`Error deleting notification with ID ${id}:`, error);
      throw error; // Re-throw the error for proper handling
    }
  }
  
}
