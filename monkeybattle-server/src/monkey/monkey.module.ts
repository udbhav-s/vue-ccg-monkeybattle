import { forwardRef, Module } from '@nestjs/common';
import { MonkeyService } from './monkey.service';
import { MonkeyController } from './monkey.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [MonkeyService, UserService],
  controllers: [MonkeyController],
  exports: [MonkeyService],
})
export class MonkeyModule {}
