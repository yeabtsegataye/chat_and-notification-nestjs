import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "notification"})

export class Notification {
    @PrimaryGeneratedColumn()
    id : bigint

    @Column()
    message : string

    @Column({default: true})
    isRead : boolean

    @ManyToOne(() => User, user => user.n_sender)
    N_sender: User
    
    @ManyToOne(() => User, user => user.n_receiver)
    N_receiver: User
}