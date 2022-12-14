import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => UserModule), PassportModule, HttpModule],
  providers: [AuthService, SessionSerializer, LocalStrategy],
})
export class AuthModule {}
