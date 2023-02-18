import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup({ username, password }: AuthCredentialsDto) {
    const hashedPass = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username, password: hashedPass });

    try {
      await this.userRepo.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('User exists');
      }
    }
  }

  async signin({
    username,
    password,
  }: AuthCredentialsDto): Promise<{ username: string; accessToken: string }> {
    const user = await this.userRepo.findOneBy({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);

      return { username, accessToken };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
