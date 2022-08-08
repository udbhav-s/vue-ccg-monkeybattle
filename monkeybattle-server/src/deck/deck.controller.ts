import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CardService } from 'src/card/card.service';
import { AuthenticatedGuard } from 'src/common/guards/authenticated.guard';
import { FormatResponseInterceptor } from 'src/common/interceptors/formatResponse.interceptor';
import { SessionRequest } from 'src/common/types/sessionRequest';
import { DeckModel } from 'src/database/models/deck.model';
import { DeckService } from './deck.service';
import { AddCardDto } from './dto/addCard.dto';
import { CreateDeckDto } from './dto/createDeck.dto';

@UseGuards(AuthenticatedGuard)
@UseInterceptors(FormatResponseInterceptor)
@Controller('api/deck')
export class DeckController {
  constructor(
    private readonly deckService: DeckService,
    private readonly cardService: CardService,
  ) {}

  @Get('/all')
  async getAll(@Req() req: SessionRequest): Promise<DeckModel[]> {
    return await this.deckService.get(undefined, req.user.id);
  }

  @Get('/:id')
  async getById(
    @Param('id') id: number,
    @Req() req: SessionRequest,
    @Query('cards') withCards?: boolean,
  ): Promise<DeckModel> {
    const result = await this.deckService.get(id, req.user.id, withCards);
    return result[0];
  }

  @UsePipes(ValidationPipe)
  @Post('/new')
  async create(
    @Body() body: CreateDeckDto,
    @Req() req: SessionRequest,
  ): Promise<DeckModel> {
    return await this.deckService.create({
      ...body,
      userId: req.user.id,
    });
  }

  @Post('/add')
  async addCard(@Body() body: AddCardDto, @Req() req: SessionRequest) {
    // check if user owns deck
    const rows = await this.deckService.get(body.deckId, req.user.id, true);
    const deck = rows[0];
    if (!deck) throw new NotFoundException();

    // check if deck is full
    if (deck.getNumCards() == 20)
      throw new UnauthorizedException('Deck is full');

    // check if user owns card
    const userCard = (
      await this.cardService.get({ id: body.cardId }, req.user.id)
    )[0];
    if (!userCard) throw new UnauthorizedException();

    const cardInDeck = deck.cards.find((c) => c.id === body.cardId);

    // check if class matches deck
    if (
      userCard.gameClassId &&
      deck.monkey.gameClassId !== userCard.gameClassId
    )
      throw new UnauthorizedException();

    // check if card can be inserted
    if (
      cardInDeck &&
      (cardInDeck.count == 2 || cardInDeck.count >= userCard.count)
    ) {
      throw new UnauthorizedException('Cannot add any more of that card');
    }

    return await this.deckService.addCard(body.deckId, body.cardId);
  }

  @Post('/remove')
  async removeCard(@Body() body: AddCardDto, @Req() req: SessionRequest) {
    // check if user owns deck
    const deck = this.deckService.get(body.deckId, req.user.id);
    if (!deck) throw new NotFoundException();

    const cardInDeck = await this.deckService.getCards(
      body.deckId,
      body.cardId,
    );
    if (cardInDeck) {
      return await this.deckService.removeCard(body.deckId, body.cardId);
    }
  }

  @Delete('/:id')
  async deleteDeck(@Param('id') id: number, @Req() req: SessionRequest) {
    return await this.deckService.del(id, req.user.id);
  }
}
