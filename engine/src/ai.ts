import {
  Game,
  GameCardTypes,
  GameStage,
  GameState,
  getValidTargets,
  Player,
  TargetSelect,
  TargetTypes,
} from '.';
import cloneDeep from 'fast-copy';

const otherPlayer = (player: Player, state: GameState) => {
  return state.player1.user.id === player.user.id
    ? state.player2
    : state.player1;
};

export const getPlayerScore = (player: Player, state: GameState): number => {
  let score = 0;

  // health
  score += 2 * Math.sqrt(player.monkeyHealth);
  // hand cards
  score += 2 * player.hand.length;
  // deck
  score += Math.sqrt(player.deck.length);
  // creatures on board
  for (const card of player.board) {
    if (card.health && card.attack) score += card.health + card.attack;
  }
  // enemy board cleared
  if (otherPlayer(player, state).board.length === 0)
    score += 2 + Math.min(state.round, Math.min(state.round, 8));

  return score;
};

export const getPlayerAdvantage = (
  player: Player,
  state: GameState,
): number => {
  const other = otherPlayer(player, state);
  let adv = getPlayerScore(player, state) - getPlayerScore(other, state);

  if (state.stage === GameStage.Ended) {
    if (state.winner === player.user.id) adv = Infinity;
    else adv = -Infinity;
  }

  return adv;
};

const getPlayerFromGame = (player: Player, game: Game) => {
  return game.state.player1.user.id === player.user.id
    ? game.state.player1
    : game.state.player2;
};

export const makeNextMove = (player: Player, game: Game): boolean => {
  let maxAdv = 0;
  let move = {} as
    | { action: 'playCreature'; params: Parameters<Game['playCreature']> }
    | { action: 'playSpell'; params: Parameters<Game['playSpell']> }
    | { action: 'attack'; params: Parameters<Game['attack']> };

  // go through cards in hand
  for (const card of player.hand) {
    if (card.type === GameCardTypes.CREATURE) {
      if (card.instant?.targets?.select === TargetSelect.ByPlayer) {
        const targets = getValidTargets(
          card,
          card.instant.targets,
          player,
          game.otherPlayer(player),
        );

        for (const target of targets) {
          const t =
            target === TargetTypes.EnemyMonkey
              ? target
              : (target.uid as string);

          const gameCopy = new Game(
            undefined,
            undefined,
            cloneDeep(game.state),
          );

          const gameCopyPlayer = getPlayerFromGame(player, gameCopy);

          const params = [
            gameCopyPlayer,
            { uid: card.uid as string, target: t },
            false,
            true,
          ] as Parameters<Game['playCreature']>;

          try {
            gameCopy.playCreature(...params);
          } catch (e) {
            continue;
          }

          const adv = getPlayerAdvantage(gameCopyPlayer, gameCopy.state);

          if (adv > maxAdv || !move.action) {
            maxAdv = adv;
            move = { action: 'playCreature', params };
          }
        }
      } else {
        const gameCopy = new Game(undefined, undefined, cloneDeep(game.state));

        const gameCopyPlayer = getPlayerFromGame(player, gameCopy);

        const params = [
          gameCopyPlayer,
          { uid: card.uid as string, target: '' },
          false,
          true,
        ] as Parameters<Game['playCreature']>;

        try {
          gameCopy.playCreature(...params);
        } catch (e) {
          continue;
        }

        const adv = getPlayerAdvantage(gameCopyPlayer, gameCopy.state);

        if (adv > maxAdv || !move.action) {
          maxAdv = adv;
          move = { action: 'playCreature', params };
        }
      }
    } else if (card.type === GameCardTypes.SPELL) {
      if (card.spell?.targets?.select === TargetSelect.ByPlayer) {
        const targets = getValidTargets(
          card,
          card.spell.targets,
          player,
          game.otherPlayer(player),
        );

        for (const target of targets) {
          const t =
            target === TargetTypes.EnemyMonkey
              ? target
              : (target.uid as string);

          const gameCopy = new Game(
            undefined,
            undefined,
            cloneDeep(game.state),
          );

          const gameCopyPlayer = getPlayerFromGame(player, gameCopy);

          const params = [
            gameCopyPlayer,
            { uid: card.uid as string, target: t },
            false,
            true,
          ] as Parameters<Game['playSpell']>;

          try {
            gameCopy.playSpell(...params);
          } catch (e) {
            continue;
          }

          const adv = getPlayerAdvantage(gameCopyPlayer, gameCopy.state);

          if (adv > maxAdv || !move.action) {
            maxAdv = adv;
            move = { action: 'playSpell', params };
          }
        }
      } else {
        const gameCopy = new Game(undefined, undefined, cloneDeep(game.state));

        const gameCopyPlayer = getPlayerFromGame(player, gameCopy);

        const params = [
          gameCopyPlayer,
          { uid: card.uid as string, target: '' },
          false,
          true,
        ] as Parameters<Game['playSpell']>;

        try {
          gameCopy.playSpell(...params);
        } catch (e) {
          continue;
        }

        const adv = getPlayerAdvantage(gameCopyPlayer, gameCopy.state);

        if (adv > maxAdv || !move.action) {
          maxAdv = adv;
          move = { action: 'playSpell', params };
        }
      }
    }
  }

  // go through cards on board
  for (const card of player.board) {
    if (card.enabled && !card.attackDisabled) {
      const targets = game
        .otherPlayer(player)
        .board.map((c) => c.uid as string);
      targets.push('EnemyMonkey');

      for (const target of targets) {
        const gameCopy = new Game(undefined, undefined, cloneDeep(game.state));

        const gameCopyPlayer = getPlayerFromGame(player, gameCopy);

        const params = [
          gameCopyPlayer,
          { uid: card.uid, target: target },
          false,
          true,
        ] as Parameters<Game['attack']>;

        try {
          gameCopy.attack(...params);
        } catch (e) {
          continue;
        }

        const adv = getPlayerAdvantage(gameCopyPlayer, gameCopy.state);

        if (adv > maxAdv || !move.action) {
          maxAdv = adv;
          move = { action: 'attack', params };
        }
      }
    }
  }

  // play best approximated move
  if (move.action) {
    move.params[0] = player;
    move.params[3] = false;
    game[move.action](...move.params);
    return true;
  } else {
    // no moves found
    return false;
  }
};
