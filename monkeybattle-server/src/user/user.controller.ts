import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { MonkeyService } from 'src/monkey/monkey.service';
import { CardService } from 'src/card/card.service';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/formatResponse.interceptor';
import { UserModel } from 'src/database/models/user.model';
import { DeckService } from 'src/deck/deck.service';
import { memeStarterDeck } from 'src/game/starter/decks/memeStarter';
import { starterCards } from 'src/game/starter/starterCards';
import { UserService } from './user.service';
import { festiveStarterDeck } from 'src/game/starter/decks/festiveStarter';
import { moviesStarterDeck } from 'src/game/starter/decks/moviesStarter';
import { GameClass } from 'monkeybattle-shared';
import { UserGetOptionsDto } from './dto/userGetOptions.dto';
import { SessionRequest } from 'src/common/types/sessionRequest';
import { SignUpDto } from './dto/signup.dto';
import { LoginGuard } from 'src/common/guards/login.guard';

@UseInterceptors(FormatResponseInterceptor)
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly monkeyService: MonkeyService,
    private readonly cardService: CardService,
    private readonly deckService: DeckService,
  ) {}

  @UseGuards(LoginGuard)
  @Post('/login')
  login(@Body() body: SignUpDto, @Req() req: any): UserModel {
    return req.user;
  }

  @Post('/register')
  async register(@Body() body: SignUpDto): Promise<number> {
    // check if name exists
    let user = await this.userService.getByName(body.username);
    if (user) throw new BadRequestException('User already exists');

    // register
    user = await this.userService.create(body);

    // add initial cards
    await this.cardService.addInitialCardsToUser(starterCards, user.id);

    // add all monkeys
    const monkeys = await this.monkeyService.getAllMonkeys();
    const monkeyIds = monkeys.map((m) => m.id);
    await this.monkeyService.addMonkeysToUser(monkeyIds, user.id);

    // add starter decks

    // this asserts at least one monkey of each class exists
    const memeMonkeyId = monkeys.find(
      (m) => m.gameClass.name === GameClass.Memes,
    )?.id as number;
    const moviesMonkeyId = monkeys.find(
      (m) => m.gameClass.name === GameClass.Movies,
    )?.id as number;
    const festiveMonkeyId = monkeys.find(
      (m) => m.gameClass.name === GameClass.Festive,
    )?.id as number;

    const starterDeckPromises = [
      this.deckService.addStarter(memeStarterDeck, memeMonkeyId, user.id),
      this.deckService.addStarter(moviesStarterDeck, moviesMonkeyId, user.id),
      this.deckService.addStarter(festiveStarterDeck, festiveMonkeyId, user.id),
    ];

    await Promise.all(starterDeckPromises);

    return user.id;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/all')
  async getAllUsers(
    @Query(new ValidationPipe({ transform: true })) options: UserGetOptionsDto,
  ): Promise<UserModel[]> {
    if (!options) options = {};
    if (!options.limit) options.limit = 20;
    return await this.userService.getAll(options);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/self')
  getSelf(@Req() req: SessionRequest): UserModel {
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('/logout')
  logout(@Req() req: SessionRequest) {
    req.logout();
  }
}
