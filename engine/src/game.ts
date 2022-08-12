import { GameState } from './state';
import shuffle from 'lodash.shuffle';
import cloneDeep from 'fast-copy';
import EventEmitter from 'eventemitter3';
import {
  GameCard,
  GameCardTypes,
  GameStage,
  MissingTargetError,
  Player,
  TargetSelect,
  Triggers,
} from '.';
import { uid } from 'uid';
import cards from './data/cards';
import { Timeout, TimeoutInstance } from 'smart-timeout/lib/timeout';
import { User } from './user';
import { Monkey } from './monkey';
import { TriggerConditions } from './data/conditions';
import { processTargets } from './util/processTargets';
import {
  getValidTargets,
  SelectableTarget,
  Target,
  TargetTypes,
} from './target';
import { Effects } from './data/effects';
import { gameConfig } from './config';

type targetParam = { uid: string; target: string };

// interfaces with db objects
interface CardModel {
  name: string;
}

export interface AddPlayer {
  user: User;
  deck: {
    monkey: Monkey;
    cards: CardModel[];
  };
}

const sleep = (ms: number) => {
  return new Promise((resolve) => Timeout.set(resolve, ms));
};

const initGameCard = (card: GameCard): GameCard => {
  card.uid = uid();
  if (!card.modifiers) card.modifiers = {};
  card.baseHealth = card.health;
  return card;
};

const cardModelToGameCards = (cardModels: CardModel[]): GameCard[] => {
  const gameCards: GameCard[] = [];
  for (const cardModel of cardModels) {
    // shallow copy
    let gameCard = cloneDeep(cards.find((c) => c.name === cardModel.name));
    if (!gameCard || !gameCard.name)
      throw new Error(
        `Could not find matching game card for model named ${cardModel.name}`,
      );
    gameCard = initGameCard(gameCard);
    gameCards.push(gameCard);
  }
  return gameCards;
};

export class Game {
  state: GameState;
  // for sending state update & game action notifications outside
  actions: EventEmitter;
  // game event emitter manages game events internally
  eventEmitter: EventEmitter;
  triggers: { cardUid: string; handler: any }[] = [];
  config = gameConfig;
  // not currently used as this.timeout, added for debugging
  turnTimeout?: TimeoutInstance;

  constructor(p1?: AddPlayer, p2?: AddPlayer, state?: GameState) {
    this.actions = new EventEmitter();
    this.eventEmitter = new EventEmitter();

    if (p1 && p2) {
      // instantiate players
      const player1 = new Player(p1.user, p1.deck.monkey, 20);
      player1.deck = cardModelToGameCards(p1.deck.cards);

      const player2 = new Player(p2.user, p2.deck.monkey, 20);
      player2.deck = cardModelToGameCards(p2.deck.cards);

      // create game state
      this.state = new GameState(player1, player2);
    } else if (state) {
      // copy from existing state
      this.state = state;
    } else throw new Error('State or players must be defined');

    // register triggers
    // enable cards on board at the start of each turn
    this.eventEmitter.on(
      Triggers.TurnStartTrigger,
      (data: { player: Player }) => {
        for (const card of data.player.board) card.enabled = true;
      },
    );

    // game end trigger
    this.eventEmitter.on(
      Triggers.VictoryTrigger,
      (data: { player: Player; disconnect?: boolean }) => {
        this.state.stage = GameStage.Ended;
        this.state.winner = data.player.user.id;
        this.state.gameData = {
          opponentDisconnected: data.disconnect || false,
        };
        this.turnTimeout?.clear();
        this.actions.emit('victory', data);
      },
    );
  }

  otherPlayer(player: Player): Player {
    return player.user.id == this.state.player1.user.id
      ? this.state.player2
      : this.state.player1;
  }

  shuffleDeck(player: Player) {
    player.deck = shuffle(player.deck);
  }

  drawFromDeck(player: Player, n: number): GameCard[] {
    return player.deck.splice(player.deck.length - n, n);
  }

  destroyCard(cardUid: string) {
    let player;
    let card = this.state.player1.board.find((c) => c.uid === cardUid);

    if (card) player = this.state.player1;
    else {
      card = this.state.player2.board.find((c) => c.uid === cardUid);
      if (card) player = this.state.player2;
      else throw new Error('Card to destroy not on board');
    }

    // remove card from board
    player.board = player.board.filter((c) => c.uid !== cardUid);
    player.dead.push(card);

    // remove card triggers
    this.triggers = this.triggers.filter((t) => t.cardUid !== card!.uid);

    this.eventEmitter.emit(Triggers.CreatureDestroyedTrigger, {
      card,
    });
  }

  dealDamage(card: GameCard, value: number) {
    if (!card.health) throw new Error('Card does not have health!');

    if (card.modifiers?.Monkeshield) {
      this.setModifier(card, 'Monkeshield', false);
    } else {
      card.health -= value;
      if (card.health <= 0) {
        this.destroyCard(card.uid!);
      } else {
        this.eventEmitter.emit(Triggers.CreatureDamagedTrigger, {
          card,
          damage: value,
        });
      }
    }
  }

  heal(card: GameCard, value: number) {
    if (!card.health || !card.baseHealth)
      throw new Error('Card does not have health!');

    card.health += value;
    if (card.health > card.baseHealth) card.health = card.baseHealth;
  }

  setBananas(card: GameCard, value: number) {
    card.bananas = value;
  }

  setAttack(card: GameCard, value: number) {
    card.attack = value;
  }

  setHealth(card: GameCard, value: number) {
    card.health = value;
    if (card.health <= 0) this.destroyCard(card.uid as string);
  }

  dealMonkeyDamage(player: Player, damage: number) {
    player.monkeyHealth -= damage;
    if (player.monkeyHealth <= 0) {
      this.eventEmitter.emit(Triggers.VictoryTrigger, {
        player: this.otherPlayer(player),
      });
    } else {
      this.eventEmitter.emit(Triggers.MonkeyDamagedTrigger, {
        player,
        damage,
      });
    }
  }

  healMonkey(player: Player, value: number) {
    player.monkeyHealth += value;
    if (player.monkeyHealth >= 20) player.monkeyHealth = 20;
  }

  setModifier(card: GameCard, modifier: string, value: any) {
    if (!card.modifiers) card.modifiers = {};
    card.modifiers[modifier] = value;
  }

  summon(player: Player, cardName: string, count?: number) {
    const card = cards.find((c) => c.name === cardName);
    if (!card) throw new Error('Could not load card!');
    if (!count) count = 1;

    for (let i = 0; i < count; i++) {
      const addCard = initGameCard({ ...card });
      if (player.board.length >= 6) return;
      player.board.push(addCard);
    }
  }

  pickCards() {
    this.state.stage = GameStage.PickCards;

    this.shuffleDeck(this.state.player1);
    this.state.player1.allowedShuffles = 4;

    this.shuffleDeck(this.state.player2);
    this.state.player2.allowedShuffles = 4;

    // give cards to pick from
    for (const player of [this.state.player1, this.state.player2]) {
      player.pickCards = player.deck.slice(
        player.deck.length - 3,
        player.deck.length,
      );
    }

    // set timeout for next stage
    Timeout.set(() => {
      if (this.state.stage === GameStage.PickCards) {
        this.startGame();
      }
    }, this.config.pickCardsTimeout);
  }

  reshuffle(player: Player) {
    if (
      player.allowedShuffles &&
      player.allowedShuffles > 0 &&
      !player.cardsPicked
    ) {
      player.allowedShuffles -= 1;
      this.shuffleDeck(player);
      player.pickCards = player.deck.slice(
        player.deck.length - 3,
        player.deck.length,
      );
    } else throw new Error('Reshuffling not allowed!');
  }

  acceptCards(player: Player) {
    player.cardsPicked = true;
    if (
      this.state.player1.cardsPicked &&
      this.state.player2.cardsPicked &&
      this.state.stage === GameStage.PickCards
    ) {
      this.startGame();
    }
  }

  registerTriggers(card: GameCard, player: Player) {
    const handler = (data: any) => {
      if (card.trigger === undefined) return;

      if (
        card.trigger.condition &&
        !TriggerConditions[card.trigger.name](card, player, this.state, data)
      )
        return;

      let targets: SelectableTarget[] = [];
      if (card.trigger?.effect.targets) {
        targets = processTargets({
          card,
          cardTargets: card.trigger.effect.targets,
          player,
          opponent: this.otherPlayer(player),
        });
      }

      Effects[card.trigger.effect.name].activate({
        targets,
        player,
        game: this,
        params: card.trigger.effect.params,
      });

      if (card.trigger.once) this.eventEmitter.off(card.trigger.name, handler);
    };

    this.eventEmitter.on(card.trigger?.name as string, handler);
    this.triggers.push({
      cardUid: card.uid as string,
      handler,
    });
  }

  nextRound(init?: boolean) {
    if (init) {
      this.state.player1.bananas = 1;
      this.state.player2.bananas = 2;
    } else {
      this.state.round++;
      for (const player of [this.state.player1, this.state.player2]) {
        player.bananas += this.state.round + 1;
        if (player.bananas > this.config.bananasLimit)
          player.bananas = this.config.bananasLimit;
      }
    }
    this.actions.emit('roundStart', this.state.round);
  }

  nextTurn() {
    const turnDraw = (player: Player) => {
      // burn cards if hand has more than limit
      // give player fatigue if they have no more cards
      if (player.deck.length === 0) {
        player.fatigue++;
        this.dealMonkeyDamage(player, player.fatigue);
      } else {
        // burn card if hand full
        if (player.hand.length >= this.config.handCardLimit) {
          this.drawFromDeck(player, 1);
          return;
        }

        const cards = this.drawFromDeck(player, 1);
        player.hand.push(...cards);
      }
    };

    let pEnd: Player, pStart: Player;
    if (this.state.turn == 0) {
      this.state.turn = 1;
      turnDraw(this.state.player2);
      pEnd = this.state.player1;
      pStart = this.state.player2;
    } else {
      this.state.turn = 0;
      this.nextRound();
      turnDraw(this.state.player1);
      pEnd = this.state.player2;
      pStart = this.state.player1;
    }

    this.actions.emit('turnStart');

    this.eventEmitter.emit(Triggers.TurnEndTrigger, {
      player: pEnd,
    });
    this.eventEmitter.emit(Triggers.TurnStartTrigger, {
      player: pStart,
    });

    // process burn and regen
    for (const card of pEnd.board) {
      if (card.modifiers?.Burn) this.dealDamage(card, card.modifiers.Burn);
      if (card.modifiers?.Regen) this.heal(card, card.modifiers.Regen);
    }

    this.resetTurnTimeout();
  }

  resetTurnTimeout() {
    const set = () => {
      this.turnTimeout = Timeout.instantiate(
        this.nextTurn.bind(this),
        this.config.turnTimeout,
      );
    };

    if (!this.turnTimeout) set();
    else {
      if (this.turnTimeout.executed()) set();
      else this.turnTimeout.restart();
    }
  }

  isPlayerTurn(player: Player): boolean {
    return (
      (this.state.turn === 0 &&
        player.user.id === this.state.player1.user.id) ||
      (this.state.turn === 1 && player.user.id === this.state.player2.user.id)
    );
  }

  playSpell(
    player: Player,
    { uid, target }: targetParam,
    onlyValidate?: boolean,
    skipDelay?: boolean,
  ) {
    if (this.state.stage !== GameStage.MainGame)
      throw new Error('You cannot do this action');
    const card = player.hand.find((c) => c.uid === uid);

    if (
      card !== undefined &&
      card.type === GameCardTypes.SPELL &&
      card.spell !== undefined &&
      this.isPlayerTurn(player) &&
      player.bananas >= card.bananas
    ) {
      const targets: SelectableTarget[] = [];

      if (card.spell.targets) {
        targets.push(
          ...processTargets({
            card,
            cardTargets: card.spell.targets,
            player,
            opponent: this.otherPlayer(player),
            playerTarget: target,
            filterDamageModifiers: card.spell.filterDamageModifiers,
          }),
        );

        if (targets.length === 0) {
          throw new Error('No valid targets for this spell');
        }
      }

      // don't execute the action
      if (onlyValidate) return;

      this.actions.emit('spellPlayed', {
        user: player.user.id,
        card,
        target:
          card.spell.targets?.select === TargetSelect.ByPlayer &&
          targets.length === 1
            ? targets[0]
            : undefined,
      });

      player.hand = player.hand.filter((c) => c.uid !== uid);
      player.bananas -= card.bananas;

      const afterDelay = () => {
        if (!skipDelay) this.turnTimeout?.resume();

        Effects[card.spell!.name].activate({
          game: this,
          targets,
          player,
          params: card.spell!.params,
        });
      };

      if (skipDelay) afterDelay();
      else {
        // pause for client animation
        this.turnTimeout?.pause();
        sleep(this.config.playSpellDelay).then(afterDelay);
      }
    } else throw new Error('Cannot play card');
  }

  playCreature(
    player: Player,
    { uid, target }: targetParam,
    onlyValidate?: boolean,
    skipDelay?: boolean,
  ) {
    if (this.state.stage !== GameStage.MainGame)
      throw new Error('You cannot do this action');
    const card = player.hand.find((c) => c.uid === uid);
    // effects must be activated after play event is sent
    let afterPlay: () => void | undefined;

    if (
      card &&
      card.type === GameCardTypes.CREATURE &&
      this.isPlayerTurn(player) &&
      player.bananas >= card.bananas &&
      player.board.length < 6
    ) {
      let targets: SelectableTarget[] = [];
      if (card.instant) {
        if (card.instant.targets) {
          try {
            targets = processTargets({
              card,
              cardTargets: card.instant.targets as Target,
              player,
              opponent: this.otherPlayer(player),
              playerTarget: target,
              filterDamageModifiers: card.instant.filterDamageModifiers,
            });
          } catch (e) {
            if (e instanceof MissingTargetError) {
              const validTargets = getValidTargets(
                card,
                card.instant.targets as Target,
                player,
                this.otherPlayer(player),
              );
              if (validTargets.length > 0) {
                throw new Error('Please select a target!');
              }
            } else throw e;
          }
        }

        afterPlay = () => {
          Effects[card.instant!.name].activate({
            game: this,
            player,
            params: card.instant!.params,
            targets,
          });
        };
      }

      // don't execute the action
      if (onlyValidate) return;

      // register triggers
      if (card.trigger) {
        this.registerTriggers(card, player);
      }

      // play card
      card.enabled = false;
      player.board.push(card);
      player.hand = player.hand.filter((c) => c.uid !== uid);
      player.bananas -= card.bananas;

      this.actions.emit('creaturePlayed', {
        user: player.user.id,
        uid: card.uid,
        target:
          card.instant?.targets?.select === TargetSelect.ByPlayer &&
          targets.length === 1
            ? targets[0]
            : undefined,
        hasInstant: card.instant ? true : false,
      });

      const afterDelay = () => {
        if (!skipDelay) this.turnTimeout?.resume();

        if (afterPlay) afterPlay();

        this.eventEmitter.emit(Triggers.CreaturePlayedTrigger, {
          player,
          card,
        });
      };

      const delay =
        card.instant && targets.length
          ? this.config.playCreatureWithInstantDelay
          : this.config.playCreatureDelay;

      if (skipDelay) afterDelay();
      else {
        // pause for client animation
        this.turnTimeout?.pause();
        sleep(delay).then(afterDelay);
      }
    } else throw new Error('Cannot play card!');
  }

  attack(
    player: Player,
    { uid, target: targetParam }: targetParam,
    onlyValidate?: boolean,
    skipDelay?: boolean,
  ) {
    if (this.state.stage !== GameStage.MainGame)
      throw new Error('You cannot do this action');

    const card = player.board.find((c) => c.uid === uid);
    const opponent = this.otherPlayer(player);
    let target: SelectableTarget;

    if (targetParam !== TargetTypes.EnemyMonkey) {
      const t = opponent.board.find((c) => c.uid === targetParam);
      if (!t) throw new Error('Invalid target!');
      target = t;
    } else target = targetParam;

    if (card && card.attackDisabled) {
      throw new Error('Card cannot attack!');
    }

    if (card && this.isPlayerTurn(player) && card.enabled) {
      // check for blockers
      const hasBlocker = opponent.board.find((c) => c.modifiers?.Blocker);
      if (hasBlocker) {
        if (target === TargetTypes.EnemyMonkey || !target.modifiers?.Blocker) {
          throw new Error('Cannot attack with Blocker on board!');
        }
      }
      // check if camo
      if (target !== TargetTypes.EnemyMonkey && target.modifiers?.Camo) {
        throw new Error('Cannot attack a creature with Camo!');
      }

      // validated - return without performing action
      if (onlyValidate) return;

      // if high, pick another valid target with chance
      if (card.modifiers?.High) {
        const otherValidTargets: SelectableTarget[] = [];
        if (hasBlocker) {
          otherValidTargets.push(
            ...opponent.board.filter((c) => c.modifiers?.Blocker),
          );
        } else {
          otherValidTargets.push(
            ...opponent.board.filter((c) => !c.modifiers?.Camo),
            TargetTypes.EnemyMonkey,
          );
        }
        target = Math.random() > 0.5 ? target : shuffle(otherValidTargets)[0];
      }

      this.actions.emit('creatureAttack', {
        user: player.user.id,
        attackingUid: card.uid,
        attacked: target,
      });

      const afterDelay = () => {
        if (!skipDelay) this.turnTimeout?.resume();

        // disable card - state update following damage
        card.enabled = false;

        // attack
        if (target === TargetTypes.EnemyMonkey)
          this.dealMonkeyDamage(opponent, card.attack!);
        else {
          this.dealDamage(target, card.attack!);
          this.dealDamage(card, target.attack!);
        }

        // attack trigger
        this.eventEmitter.emit(Triggers.CreatureAttackTrigger, {
          attackingCreature: card,
          attacked: target,
          damage: card.attack,
        });
      };

      if (skipDelay) afterDelay();
      else {
        // pause for client animation
        this.turnTimeout?.pause();
        sleep(this.config.attackDelay).then(afterDelay);
      }
    }
  }

  doneTurn(player: Player, noTimeout?: boolean) {
    if (this.isPlayerTurn(player)) {
      this.nextTurn();
      if (!noTimeout) this.resetTurnTimeout();
    }
  }

  startGame() {
    this.state.stage = GameStage.MainGame;

    // draw picked cards (remove from deck and into hand)
    for (const player of [this.state.player1, this.state.player2]) {
      player.pickCards = [];
      player.hand = this.drawFromDeck(player, 3);
    }

    this.state.turn = 0;
    this.state.round = 0;
    this.nextRound(true);

    // start turn timeout
    this.resetTurnTimeout();
  }

  disconnect(player: Player) {
    this.eventEmitter.emit(Triggers.VictoryTrigger, {
      player: this.otherPlayer(player),
      disconnect: true,
    });
  }
}
