/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('oauth')
export class AuthController {
  @Get('/monkeyconnect/callback')
  @UseGuards(AuthGuard('monkeyconnect'))
  async getUserFromMonkeyconnectLogin(@Res() res: Response): Promise<void> {
    res.redirect('');
  }
}
