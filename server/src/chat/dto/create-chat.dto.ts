import { User } from "src/user/entities/user.entity";

export class CreateChatDto {
    sender: User;
    receiver: User;
}
