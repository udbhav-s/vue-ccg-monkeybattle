import { GameCard, Player, GameState, Triggers } from '../../';

const TriggerConditions: {
  [key: string]: (
    card: GameCard,
    player: Player,
    game: GameState,
    event: any,
  ) => boolean;
} = {};

TriggerConditions[Triggers.TurnStartTrigger] = (card, player, game, event) => {
  let condition = true;
  if (card.trigger && card.trigger.condition.player === 'SELF')
    condition = player.user.id === event.player.user.id;
  return condition;
};

TriggerConditions[Triggers.TurnEndTrigger] =
  TriggerConditions[Triggers.TurnStartTrigger];

export { TriggerConditions };
