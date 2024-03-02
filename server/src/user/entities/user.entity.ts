import { Chat } from "src/chat/entities/chat.entity";
import { Message } from "src/message/entities/message.entity";
import { Notification } from "src/notification/entities/notification.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

// Define the User entity representing a user in the system.
@Entity()
export class User {
    // Primary key auto-generated ID for the user.
    @PrimaryGeneratedColumn()
    id: number;

    // Unique email for the user.
    @Column({ unique: true })
    email: string;

    // Password for user authentication (should be hashed).
    @Column()
    Password: string;

    // Role of the user (default: 'admin').
    @Column({default: 'admin'})
    Role: string;

    // Each user can send multiple messages.
    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];

    // Each user can receive multiple messages.
    @OneToMany(() => Message, message => message.receiver)
    receivedMessages: Message[];

    // Each user can be a sender in multiple chats.
    @OneToMany(() => Chat, chat => chat.sender)
    chatSender: Chat[];

    // Each user can be a receiver in multiple chats.
    @OneToMany(() => Chat, chat => chat.receiver)
    chatReceiver: Chat[];

    @OneToMany(() => Notification, (notification) => notification.N_sender)
    n_sender: Notification[];

    @OneToMany(() => Notification, (notification) => notification.N_receiver)
    n_receiver: Notification[];
}
// The @OneToMany decorators you provided in the User entity 
// are for establishing relationships between the User entity 
// and other entities (Message and Chat entities in this case).
//  They do not directly create columns on the User table. 
//  Instead, they define the relationships in 
//  the object-relational mapping (ORM) layer.

// CREATE TABLE user (
//     id SERIAL PRIMARY KEY,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     password VARCHAR(255) NOT NULL,
//     role VARCHAR(255) DEFAULT 'admin'
// );