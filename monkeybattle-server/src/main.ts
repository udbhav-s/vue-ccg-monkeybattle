import { NestFactory } from '@nestjs/core';
import { json } from 'body-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as passport from 'passport';
import { MonkeyService } from './monkey/monkey.service';
import { CardService } from './card/card.service';
import { sessionMiddleware } from './common/util/session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // set up passport
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // request size limit
  app.use(json({ limit: '50MB' }));

  // use global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // update classes and monkeys
  logger.log('Updating monkeys and classes');
  await app.get(MonkeyService).syncMonkeysAndClasses();

  // update cards from sets
  logger.log('Adding cards from sets');
  await app.get(CardService).addFromSets();

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
