// import { isNotEmpty } from "class-validator"
import { User } from "src/user/entities/user.entity";

export class CreateMessageDto {

    message : string

    sender : User

    receiver : User
}
