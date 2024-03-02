import { User } from "src/user/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'chat'})
export class Chat {

   @PrimaryGeneratedColumn()
   id : bigint;
// on this part this will be many to one user .. first we import
// the user and then select the chatsender and plas it in the sender
// attribute
   @ManyToOne(() => User, user => user.chatSender)
   sender: User;

   @ManyToOne(() => User, user => user.chatReceiver)
   receiver: User; 
}

// CREATE TABLE chat (
//     id bigint PRIMARY KEY,
//     senderId int,
//     receiverId int,
//     FOREIGN KEY (senderId) REFERENCES user (id),
//     FOREIGN KEY (receiverId) REFERENCES user (id)
// );
