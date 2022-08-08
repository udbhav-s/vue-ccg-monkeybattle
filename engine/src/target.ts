import { GameCard } from './gameCard';

export enum TargetTypes {
  Self = 'Self',
  FriendlyCreature = 'FriendlyCreature',
  EnemyCreature = 'EnemyCreature',
  EnemyMonkey = 'EnemyMonkey',
}

export type SelectableTarget = GameCard | TargetTypes.EnemyMonkey;

export enum TargetSelect {
  ByPlayer,
  Auto,
  Event,
}

export type TargetCount = number | 'ALL';

export interface Target {
  type: TargetTypes[];
  select: TargetSelect;
  count?: TargetCount;
  event?: any;
}

interface ValidPlayer {
  board: GameCard[];
}

export const getValidTargets = (
  card: GameCard,
  cardTargets: Target,
  player: ValidPlayer,
  opponent: ValidPlayer,
): SelectableTarget[] => {
  const selectableTargets: SelectableTarget[] = [];

  if (cardTargets.type.includes(TargetTypes.Self)) selectableTargets.push(card);
  if (cardTargets.type.includes(TargetTypes.FriendlyCreature))
    selectableTargets.push(...player.board.filter((c) => c.uid !== card.uid));
  if (cardTargets.type.includes(TargetTypes.EnemyCreature))
    selectableTargets.push(...opponent.board);
  if (cardTargets.type.includes(TargetTypes.EnemyMonkey))
    selectableTargets.push(TargetTypes.EnemyMonkey);

  return selectableTargets;
};
