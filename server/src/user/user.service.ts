import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwt: JwtService,
  ) {}
  // constructor(private jwt : JwtService){}

  async Login(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string; id: number }> {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const match = await bcrypt.compare(createUserDto.password, user.Password);
    if (!match) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, role: user.Role,email : user.email };

    return {
      access_token: await this.jwt.signAsync(payload),
      id: user.id,
    };
  }
  async SignUp(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    console.log(hash);

    const user = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: createUserDto.email,
          Password: hash,
          Role: createUserDto.Role,
        },
      ])
      .execute();
    console.log(user);

    return `User created successfully`;
  }

  async Getuser(){
    const get = await this.userRepository.find()
    return get;
  }
}
