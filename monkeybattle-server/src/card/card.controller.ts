import {
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/formatResponse.interceptor';
import { SessionRequest } from 'src/common/types/sessionRequest';
import { CardService } from './card.service';

@UseInterceptors(FormatResponseInterceptor)
@Controller('api/card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('/user')
  async getUserCards(@Req() req: SessionRequest) {
    return await this.cardService.get({}, req.user.id);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/all')
  async getAllCards() {
    return await this.cardService.get({});
  }
}
