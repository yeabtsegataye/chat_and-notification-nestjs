import { User } from "src/user/entities/user.entity"

export class CreateNotificationDto {
    id: string
    message: string
    sender :User
    receiver : User
}
