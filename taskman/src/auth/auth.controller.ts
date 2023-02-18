import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  @ApiOperation({ summary: 'Create a new user' })
  async signup(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signup(authCredentialsDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'Login a user' })
  async signin(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signin(authCredentialsDto);
  }
}
