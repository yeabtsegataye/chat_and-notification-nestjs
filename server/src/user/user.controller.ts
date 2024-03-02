import { Controller, Post, Body ,Get} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async Login(@Body() createUserDto: CreateUserDto) {
    return this.userService.Login(createUserDto);
  }

  @Post('signup')
  async SignUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.SignUp(createUserDto);
  }

  @Get()
  async Getuser(){
    return this.userService.Getuser()
  }
}
