import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/formatResponse.interceptor';
import { SessionRequest } from 'src/common/types/sessionRequest';
import { UserService } from 'src/user/user.service';
import { MonkeyService } from './monkey.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller('api/monkey')
export class MonkeyController {
  constructor(
    private readonly monkeyService: MonkeyService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthenticatedGuard)
  @Get('/')
  async getUserOwnMonkeys(@Req() req: SessionRequest) {
    return await this.monkeyService.getMonkeysByUser(req.user.id);
  }

  @Get('/user/:name')
  async getMonkeysByUser(@Param('address') name: string) {
    const user = await this.userService.getByName(name);
    if (!user) throw new NotFoundException();
    return await this.monkeyService.getMonkeysByUser(user.id);
  }
}
