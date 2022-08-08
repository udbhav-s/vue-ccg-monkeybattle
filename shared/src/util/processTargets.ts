import shuffle from 'lodash.shuffle';
import {
  getValidTargets,
  InvalidTargetError,
  MissingTargetError,
  Player,
  SelectableTarget,
  Target,
  TargetSelect,
  TargetTypes,
} from '../';
import { GameCard } from '../gameCard';

const filter = (cards: SelectableTarget[]) => {
  return cards.filter((c: any) => !(c.uid && c.modifiers?.Camo));
};

export type ProcessTargetParams = {
  card: GameCard;
  cardTargets: Target;
  player: Player;
  opponent: Player;
  playerTarget?: string;
  filterDamageModifiers?: boolean;
};

export const processTargets = ({
  card,
  cardTargets,
  player,
  opponent,
  playerTarget,
  filterDamageModifiers,
}: ProcessTargetParams): SelectableTarget[] => {
  if (cardTargets.select === TargetSelect.ByPlayer && playerTarget) {
    let selectedTarget: SelectableTarget;
    let selectedTargetType: TargetTypes;

    const findCard = (c: GameCard) => c.uid === playerTarget;

    if (playerTarget === TargetTypes.EnemyMonkey) {
      selectedTarget = TargetTypes.EnemyMonkey;
      selectedTargetType = TargetTypes.EnemyMonkey;
    } else if (playerTarget === card.uid) {
      selectedTarget = card;
      selectedTargetType = TargetTypes.Self;
    } else if (player.board.find(findCard)) {
      selectedTarget = player.board.find(findCard) as GameCard;
      selectedTargetType = TargetTypes.FriendlyCreature;
    } else if (opponent.board.find(findCard)) {
      selectedTarget = opponent.board.find(findCard) as GameCard;
      selectedTargetType = TargetTypes.EnemyCreature;
    } else throw new Error('Cannot find target!');

    if (cardTargets.type.includes(selectedTargetType)) {
      if (filterDamageModifiers && selectedTarget !== TargetTypes.EnemyMonkey) {
        // disallow choosing card with camo if filter is enabled
        if (selectedTarget.modifiers?.Camo)
          throw new InvalidTargetError('Cannot attack card with Camo!');
        // or if the opponent has a blocker
        if (
          !selectedTarget.modifiers?.Blocker &&
          opponent.board.find((c) => c.modifiers?.Blocker)
        )
          throw new InvalidTargetError('There is a blocker on the board!');
      }

      return [selectedTarget];
    } else throw new InvalidTargetError('Invalid target!');
  } else if (cardTargets.select === TargetSelect.ByPlayer && !playerTarget) {
    throw new MissingTargetError();
  } else if (cardTargets.select === TargetSelect.Auto) {
    const selectableTargets = getValidTargets(
      card,
      cardTargets,
      player,
      opponent,
    );

    let selectedTargets = [];
    if (cardTargets.count === 'ALL') {
      selectedTargets = selectableTargets;
    } else if (typeof cardTargets.count === 'number') {
      selectedTargets = shuffle(selectableTargets).slice(0, cardTargets.count);
    } else selectedTargets = selectableTargets;

    // blockers are not checked here because spells can bypasss
    if (filterDamageModifiers) selectedTargets = filter(selectedTargets);

    return selectedTargets;
  } else throw new Error('Target select not recognised!');
};
