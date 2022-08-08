import { EffectParams } from './effects';

export enum Triggers {
  TurnStartTrigger = 'TurnStartTrigger',
  TurnEndTrigger = 'TurnEndTrigger',
  CreaturePlayedTrigger = 'CreaturePlayedTrigger',
  CreatureDestroyedTrigger = 'CreatureDestroyedTrigger',
  CreatureDamagedTrigger = 'CreatureDamagedTrigger',
  CreatureAttackTrigger = 'CreatureAttackTrigger',
  SpellPlayedTrigger = 'SpellPlayedTrigger',
  MonkeyDamagedTrigger = 'MonkeyDamagedTrigger',
  VictoryTrigger = 'VictoryTrigger',
}

export interface TriggerParams {
  name: Triggers;
  effect: EffectParams;
  once?: boolean;
  condition?: any;
}
